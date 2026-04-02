const http = require("http");
const { readFile, stat } = require("fs/promises");
const path = require("path");

const ROOT_DIR = __dirname;
const AGENT_DIR = path.join(ROOT_DIR, "my-agent");
const PORT = Number(process.env.PORT || 3000);
const API_KEY_VARS = [
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "XAI_API_KEY",
  "GROQ_API_KEY",
  "MISTRAL_API_KEY"
];

let queryPromise = null;

function loadDotEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  try {
    const raw = require("fs").readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;
      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env file present.
  }
}

loadDotEnv();

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "text/plain; charset=utf-8";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sanitizePath(requestPath) {
  const normalized = path.normalize(requestPath).replace(/^([/\\])+/, "");
  const resolved = path.join(ROOT_DIR, normalized);
  if (!resolved.startsWith(ROOT_DIR)) {
    return null;
  }
  return resolved;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = sanitizePath(requestPath);

  if (!filePath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function getGitclawQuery() {
  if (!queryPromise) {
    queryPromise = import("gitclaw").then((mod) => mod.query);
  }
  return queryPromise;
}

function hasApiKey() {
  return API_KEY_VARS.some((name) => Boolean(process.env[name]));
}

function classifyIntent(message) {
  const normalized = message.toLowerCase();

  if (/\b(explain repo|explain repository|onboard|start)\b/.test(normalized)) {
    return "onboarding";
  }
  if (/\b(next task|next mission|mission)\b/.test(normalized)) {
    return "next_task";
  }
  if (/\b(status|progress|dashboard)\b/.test(normalized)) {
    return "status";
  }
  if (/\b(done|completed|i completed the task)\b/.test(normalized)) {
    return "completion";
  }
  return "generic";
}

function buildPrompt(message, state) {
  return [
    "You are the live Gitclaw onboarding agent shown inside a browser dashboard.",
    "Respond in concise plain text. Be helpful, practical, and user-facing.",
    "Do not mention JSON or internal implementation details.",
    "Use the provided UI state only as context.",
    "",
    `UI STATE: ${JSON.stringify(state)}`,
    `USER MESSAGE: ${message}`
  ].join("\n");
}

function buildFallbackResponse(message, state) {
  const intent = classifyIntent(message);
  const level = state?.level || "Beginner";
  const currentTask = state?.currentTask || "No active task yet.";

  if (intent === "onboarding") {
    return {
      intent,
      message:
        "Repo overview: this app combines a GitAgent onboarding mentor with a lightweight browser dashboard.\n\n" +
        `Current level: ${level}. Current task: ${currentTask}\n` +
        "Ask for 'I completed the task' when you are ready to earn XP.",
      feedback: "Onboarding started.",
      xpGained: 0,
      nextTaskSuggestion: null,
      currentTask: state?.currentTask || null,
      source: "fallback"
    };
  }

  if (intent === "next_task") {
    return {
      intent,
      message:
        `Next mission: ${currentTask === "No active task yet." ? "Read SOUL.md and summarize the agent identity." : currentTask}`,
      feedback: "Next task suggested.",
      xpGained: 0,
      nextTaskSuggestion: null,
      currentTask: state?.currentTask || null,
      source: "fallback"
    };
  }

  if (intent === "status") {
    return {
      intent,
      message:
        `Status check: level ${level}, task ${currentTask}, progress is ready for the next update.`,
      feedback: "Status returned.",
      xpGained: 0,
      nextTaskSuggestion: null,
      currentTask: state?.currentTask || null,
      source: "fallback"
    };
  }

  if (intent === "completion") {
    return {
      intent,
      message: "Task completion received. Nice work. The dashboard will update your XP and progress.",
      feedback: "Completion acknowledged.",
      xpGained: 50,
      nextTaskSuggestion: "Review RULES.md and list 3 non-negotiable constraints.",
      currentTask: state?.currentTask || null,
      source: "fallback"
    };
  }

  return {
    intent: "generic",
    message:
      "I can help with onboarding, task progress, and repo explanations. Try 'Explain repo', 'next task', 'status', or 'I completed the task'.",
    feedback: "Generic response.",
    xpGained: 0,
    nextTaskSuggestion: null,
    currentTask: state?.currentTask || null,
    source: "fallback"
  };
}

async function runAgent(message, state) {
  if (!hasApiKey()) {
    return buildFallbackResponse(message, state);
  }

  const query = await getGitclawQuery();
  const prompt = buildPrompt(message, state);
  let assistantText = "";

  try {
    for await (const event of query({
      prompt,
      dir: AGENT_DIR,
      maxTurns: 6,
      systemPromptSuffix: "Keep the final answer short enough for a dashboard chat bubble."
    })) {
      if (event.type === "delta" && event.deltaType === "text") {
        assistantText += event.content;
      }

      if (event.type === "assistant" && typeof event.content === "string") {
        assistantText = event.content;
      }
    }
  } catch (error) {
    const fallback = buildFallbackResponse(message, state);
    return {
      ...fallback,
      message:
        `Gitclaw fell back to local mode: ${error instanceof Error ? error.message : String(error)}\n\n${fallback.message}`,
      source: "fallback"
    };
  }

  const text = assistantText.trim() || "I processed your request, but no message was returned.";
  return {
    intent: classifyIntent(message),
    message: text,
    feedback: text,
    xpGained: 0,
    nextTaskSuggestion: null,
    currentTask: state?.currentTask || null,
    source: "gitclaw"
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

async function handleChat(req, res) {
  try {
    const body = await readJsonBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const state = body.state && typeof body.state === "object" ? body.state : {};

    if (!message) {
      sendJson(res, 400, { error: "Message is required." });
      return;
    }

    const agentResponse = await runAgent(message, state);

    sendJson(res, 200, agentResponse);
  } catch (error) {
    sendJson(res, 500, {
      error: "Failed to process request.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    await handleChat(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET") {
    await serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

function listen(port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });
}

async function startServer() {
  for (let port = PORT; port < PORT + 20; port += 1) {
    try {
      await listen(port);
      console.log(`Frontend server running at http://localhost:${port}`);
      return;
    } catch (error) {
      if (error && typeof error === "object" && error.code === "EADDRINUSE") {
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Unable to find a free port starting at ${PORT}`);
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
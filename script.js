(() => {
  const STORAGE_KEY = "gitagent-onboarding-state-v2";
  const TASK_LIBRARY = [
    "Read SOUL.md and summarize the agent identity.",
    "Review RULES.md and list 3 non-negotiable constraints.",
    "Inspect skills/explain-codebase/SKILL.md and describe the flow.",
    "Find one beginner-friendly improvement and propose acceptance criteria.",
    "Draft your first contribution checklist in workspace/notes.md."
  ];

  const LEVELS = [
    { name: "Beginner", minXP: 0, maxXP: 99, next: "Intermediate" },
    { name: "Intermediate", minXP: 100, maxXP: 249, next: "Advanced" },
    { name: "Advanced", minXP: 250, maxXP: Infinity, next: null }
  ];

  const elements = {
    levelText: document.getElementById("level-text"),
    xpText: document.getElementById("xp-text"),
    xpNextLevel: document.getElementById("xp-next-level"),
    xpFill: document.getElementById("xp-fill"),
    completedCount: document.getElementById("completed-count"),
    currentTask: document.getElementById("current-task"),
    streakCount: document.getElementById("streak-count"),
    chatWindow: document.getElementById("chat-window"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
    thinkingRow: document.getElementById("thinking-row"),
    toast: document.getElementById("toast"),
    resetBtn: document.getElementById("reset-btn")
  };

  let state = loadState();
  let isAwaitingResponse = false;

  init();

  function init() {
    renderDashboard();
    renderChatFromHistory();

    if (!state.chat.length) {
      addAgentMessage(
        "Welcome! I am connected to the live Gitclaw agent. Try: 'Explain repo' to begin."
      );
    }

    elements.chatForm.addEventListener("submit", onChatSubmit);
    elements.resetBtn.addEventListener("click", resetProgress);
  }

  function defaultState() {
    return {
      xp: 0,
      tasksCompleted: 0,
      currentTask: "",
      currentTaskId: null,
      nextMissionId: 1,
      streak: 0,
      lastCompletionDate: "",
      completedTaskIds: [],
      chat: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function onChatSubmit(event) {
    event.preventDefault();

    if (isAwaitingResponse) {
      showToast("The agent is still thinking.", true);
      return;
    }

    const input = elements.chatInput.value.trim();
    if (!input) {
      showToast("Please enter a message before sending.", true);
      return;
    }

    elements.chatInput.value = "";
    addUserMessage(input);
    processAgentResponse(input);
  }

  async function processAgentResponse(userInput) {
    isAwaitingResponse = true;
    setThinking(true);
    setFormEnabled(false);

    try {
      const response = await fetchAgentResponse(userInput);
      addAgentMessage(response.message);
      applyGamification(userInput, response);
      renderDashboard();
      saveState();

      if (typeof response.xpGained === "number" && response.xpGained > 0) {
        showToast(`+${response.xpGained} XP earned`);
      }

      if (response.levelUp) {
        triggerLevelUp(response.levelUp);
      }
    } catch (error) {
      addAgentMessage(
        "The backend could not reach the Gitclaw agent. Check the server is running and retry."
      );
      showToast("Agent request failed", true);
    } finally {
      isAwaitingResponse = false;
      setThinking(false);
      setFormEnabled(true);
    }
  }

  async function fetchAgentResponse(userInput) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userInput,
        state: {
          xp: state.xp,
          tasksCompleted: state.tasksCompleted,
          currentTask: state.currentTask,
          level: resolveLevel(state.xp).name,
          streak: state.streak
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Request failed");
    }

    return response.json();
  }

  function applyGamification(userInput, response) {
    const normalized = userInput.toLowerCase();
    const command = response.intent || detectIntent(normalized);

    if (command === "onboarding") {
      if (!state.currentTaskId) {
        assignNextTask(response.nextTaskSuggestion);
      }
      return;
    }

    if (command === "next_task") {
      assignNextTask(response.nextTaskSuggestion);
      return;
    }

    if (command === "completion") {
      completeCurrentTask(response);
      return;
    }

    if (command === "status" || command === "invalid" || command === "generic") {
      return;
    }
  }

  function detectIntent(normalizedInput) {
    if (includesAny(normalizedInput, ["explain repo", "explain repository", "onboard", "start"])) {
      return "onboarding";
    }

    if (includesAny(normalizedInput, ["next task", "next mission", "mission"])) {
      return "next_task";
    }

    if (includesAny(normalizedInput, ["status", "progress", "dashboard"])) {
      return "status";
    }

    if (includesAny(normalizedInput, ["done", "completed", "i completed the task"])) {
      return "completion";
    }

    return "invalid";
  }

  function completeCurrentTask(response) {
    if (!state.currentTaskId || !state.currentTask) {
      addAgentMessage("You do not have an active mission yet. Ask for 'Explain repo' first.");
      return;
    }

    if (state.completedTaskIds.includes(state.currentTaskId)) {
      addAgentMessage(
        "That mission was already completed. Duplicate XP is blocked. Ask for 'next task' if you want a fresh challenge."
      );
      return;
    }

    const xpGained = typeof response.xpGained === "number" ? response.xpGained : 50;
    const previousLevel = resolveLevel(state.xp).name;

    state.completedTaskIds.push(state.currentTaskId);
    state.tasksCompleted += 1;
    state.xp += xpGained;
    updateStreak();

    const levelInfo = resolveLevel(state.xp);
    const nextTask = assignNextTask(response.nextTaskSuggestion);

    if (levelInfo.name !== previousLevel) {
      triggerLevelUp(`LEVEL UP: ${previousLevel} -> ${levelInfo.name}`);
    }
  }

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    if (!state.lastCompletionDate) {
      state.streak = 1;
      state.lastCompletionDate = today;
      return;
    }

    if (state.lastCompletionDate === today) {
      return;
    }

    const last = new Date(state.lastCompletionDate);
    const now = new Date(today);
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

    state.streak = diffDays === 1 ? state.streak + 1 : 1;
    state.lastCompletionDate = today;
  }

  function assignNextTask(nextTaskSuggestion) {
    const task = nextTaskSuggestion || TASK_LIBRARY[(state.nextMissionId - 1) % TASK_LIBRARY.length];
    state.currentTaskId = `mission-${state.nextMissionId}`;
    state.nextMissionId += 1;
    state.currentTask = task;
    return task;
  }

  function resolveLevel(xp) {
    return LEVELS.find((lvl) => xp >= lvl.minXP && xp <= lvl.maxXP) || LEVELS[LEVELS.length - 1];
  }

  function xpProgress() {
    const info = resolveLevel(state.xp);
    if (info.maxXP === Infinity) {
      return { percent: 100, text: "Max level reached" };
    }

    const span = info.maxXP - info.minXP + 1;
    const intoLevel = state.xp - info.minXP;
    const percent = Math.min(100, Math.floor((intoLevel / span) * 100));
    const remaining = info.maxXP - state.xp + 1;

    return {
      percent,
      text: `${remaining} XP to ${info.next}`
    };
  }

  function renderDashboard() {
    const levelInfo = resolveLevel(state.xp);
    const progress = xpProgress();

    elements.levelText.textContent = levelInfo.name;
    elements.xpText.textContent = `${state.xp} XP`;
    elements.completedCount.textContent = String(state.tasksCompleted);
    elements.streakCount.textContent = String(state.streak);
    elements.currentTask.textContent =
      state.currentTask || "Ask me to explain this repository to start your onboarding journey.";

    elements.xpFill.style.width = `${progress.percent}%`;
    elements.xpNextLevel.textContent = progress.text;

    const track = elements.xpFill.parentElement;
    track.setAttribute("aria-valuenow", String(progress.percent));
  }

  function addUserMessage(text) {
    state.chat.push({ sender: "user", text, ts: Date.now() });
    appendChatBubble("user", text);
    saveState();
  }

  function addAgentMessage(text) {
    state.chat.push({ sender: "agent", text, ts: Date.now() });
    appendChatBubble("agent", text);
    saveState();
  }

  function appendChatBubble(sender, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    elements.chatWindow.appendChild(bubble);
    elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
  }

  function renderChatFromHistory() {
    elements.chatWindow.innerHTML = "";
    state.chat.forEach((item) => appendChatBubble(item.sender, item.text));
  }

  function setThinking(isThinking) {
    elements.thinkingRow.classList.toggle("hidden", !isThinking);
  }

  function setFormEnabled(enabled) {
    elements.chatInput.disabled = !enabled;
    elements.chatForm.querySelector("button[type='submit']").disabled = !enabled;
  }

  function triggerLevelUp(message) {
    addAgentMessage(message);
    elements.levelText.classList.remove("level-up-pulse");
    void elements.levelText.offsetWidth;
    elements.levelText.classList.add("level-up-pulse");
    showToast("Level up unlocked");
  }

  function showToast(text, isError = false) {
    elements.toast.textContent = text;
    elements.toast.style.borderColor = isError ? "rgba(255,107,107,0.75)" : "rgba(33,245,207,0.45)";
    elements.toast.classList.add("show");

    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 1800);
  }

  function includesAny(text, phrases) {
    return phrases.some((phrase) => text.includes(phrase));
  }

  function resetProgress() {
    state = defaultState();
    saveState();
    renderDashboard();
    renderChatFromHistory();
    addAgentMessage("Progress reset. Say 'Explain repo' to start from level 1.");
    showToast("Progress reset complete");
  }
})();

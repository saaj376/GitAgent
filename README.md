# GitAgent Codebase Onboarding and Gamified Learning Agent

This repository contains an autonomous AI agent system designed to facilitate seamless developer onboarding through a gamified, interactive experience. Built with a focus on repository exploration and practical task completion, the system integrates the Gitclaw agentic engine with a modern web-based dashboard.

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technical Architecture](#technical-architecture)
4. [Technology Stack](#technology-stack)
5. [Getting Started](#getting-started)
6. [Gamification System](#gamification-system)
7. [System Components](#system-components)
8. [Configuration](#configuration)

---

## Overview

The GitAgent Onboarding system addresses the cognitive overhead associated with entering new codebases. By providing a live, context-aware AI mentor, the platform guides developers through a sequence of missions that build fundamental knowledge of the repository's structure, rules, and development patterns.

The experience is fully interactive: users chat with a Gitclaw-powered agent that can analyze files, explain concepts, and validate task progress in real-time.

---

## Key Features

- **Autonomous Onboarding**: Interactive chat interface for repository exploration and guidance.
- **Gamified Progress Tracking**: Integrated XP system, levels, and daily streaks to maintain engagement.
- **Mission-Based Learning**: A sequential task library designed to transition developers from "Beginner" to "Advanced" repository proficiency.
- **Context-Aware Intelligence**: Utilizing Gitclaw's agentic capabilities to provide accurate answers about the local codebase.
- **Local Persistence**: State-of-the-art browser storage ensuring progress is saved between sessions.
- **Health Monitoring**: Integrated API health checks for backend connectivity.

---

## Technical Architecture

The system utilizes a 3-tier architecture designed for low latency and high reliability:

1.  **Frontend Layer**: A vanilla JavaScript single-page application (SPA) that manages UI state and gamification logic locally.
2.  **Backend Layer**: A lightweight Node.js server that serves static assets and acts as a secure proxy to the AI orchestration layer.
3.  **AI Engine (Gitclaw)**: An agentic orchestration framework that executes multi-turn reasoning and tool-calling (cli, read, write, memory) to provide repository-specific insights.

---

## Technology Stack

### Frontend
- **HTML5/CSS3**: Utilizes modern layouts with glassmorphism aesthetics and custom animations.
- **Vanilla JavaScript**: Zero-dependency state management and DOM manipulation.
- **Google Fonts**: Space Grotesk and IBM Plex Mono for a premium technical feel.

### Backend
- **Node.js**: Native `http` and `fs/promises` implementation for maximum performance.
- **Gitclaw SDK**: Primary engine for LLM-powered repository analysis.
- **Gemini 2.5 Flash**: Optimized model for fast, accurate response generation.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Valid API Key for one of the supported providers (Google Gemini, OpenAI, Anthropic, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/saaj376/GitAgent-Hackathon.git
   cd GitAgent-Hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your API key:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```

### Running the Application

Start the development server:
```bash
npm start
```

Once the server is running, navigate to `http://localhost:3000` in your web browser.

---

## Gamification System

The progression system is designed to reward consistent exploration and learning.

### Level Progression

| Level | XP Range | Description |
| :--- | :--- | :--- |
| Beginner | 0 - 99 | Initial repository exploration. |
| Intermediate | 100 - 249 | Understanding of core logic and rules. |
| Advanced | 250+ | Proficiency in codebase contribution. |

### Mechanics
- **XP Gained**: Default 50 XP per mission completion.
- **Daily Streaks**: Multi-day engagement tracking for consistency bonuses.
- **Automatic Leveling**: Real-time level-up animations and unlocked challenges.

---

## System Components

- **server.js**: Handles static file serving, `.env` loading, and the `/api/chat` endpoint.
- **script.js**: Contains the core UI logic, XP calculations, and intent classification.
- **agent.yaml**: Defines the Gitclaw agent's toolset and model preferences.
- **SOUL.md**: Specifies the personality and operational constraints of the AI mentor.
- **style.css**: Implements the visual design system and responsive layouts.

---

## Configuration

The AI agent's behavior can be tuned by modifying `agent.yaml`. You can adjust the `max_turns`, change the preferred model, or add/remove tools available to the agent.

For UI logic or XP balancing, modifications should be made within `script.js` under the `LEVELS` and `TASK_LIBRARY` constants.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
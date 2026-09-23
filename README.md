# FOCUS FORGE — AI-Powered Focus & Personal Growth Platform

> **Forge your focus. Build your future.**
> An AI-powered personal productivity operating system combining intelligent multi-goal scheduling, distraction-minimized focus tracking, deterministic rewards, and context-aware AI coaching.

---

## 🌟 Visual Theme & Design Identity

- **Theme Name**: FORGE / DARK MATTER
- **Color Palette**:
  - Background: `#080B0A` (Deep Obsidian)
  - Secondary Background: `#101613` (Charcoal Tint)
  - Card Surface: `#151D19` / Card Border: `#23332A`
  - Primary Accent: `#43F59A` (Electric Emerald / Forge Glow)
  - Secondary Accent: `#B1FFD0` (Mint Glow)
  - Text: `#F4F7F5` (Primary), `#99A79F` (Secondary), `#627068` (Muted)
  - Status: `#FFB547` (Warning), `#FF6B6B` (Error), `#47B5FF` (Info)

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: Next.js Server Route Handlers, modular AI Service layer, deterministic Rewards Engine, Pause-Audited Timer Engine.
- **Authentication**: Supabase Auth SSR (OAuth Google, Email/Password, Magic Link, Phone OTP) with instant 1-Click Interactive Demo fallback.
- **Database**: MongoDB Atlas / Resilient in-memory Mock Store for immediate zero-config testing.

---

## 🚀 Quick Start Guide

### 1. Installation

```bash
# Clone repository
git clone <repo-url>
cd "FOCUS FORGE"

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment configuration file:

```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true # Set to false when live Supabase & MongoDB Atlas are configured

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# MongoDB Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/focusforge?retryWrites=true&w=majority

# AI Provider (Options: "gemini" | "openai" | "claude" | "ollama" | "mock")
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-or-openai-api-key
AI_MODEL=gemini-1.5-flash

# Google Drive Integration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google-drive/callback
```

### 3. Running Locally

```bash
# Run development server
npm run dev

# Run automated test suite
npm run test

# Build for production
npm run build
```

Visit `http://localhost:3000` in your browser.

---

## 🎯 Application Feature Matrix

| Feature Module | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Dark Matter Landing Page** | `/` | 🟢 Complete | Interactive demo launch, philosophy loop, feature showcase |
| **Authentication & Recovery** | `/login`, `/signup`, `/verify-*`, `/forgot-*` | 🟢 Complete | Supabase Auth SSR + 1-Click Demo Persona Switcher |
| **7-Step Onboarding Engine** | `/onboarding` | 🟢 Complete | Role, multi-goals, routines, challenges, AI starter plan |
| **Central Productivity Dashboard** | `/dashboard` | 🟢 Complete | GitHub-style Heatmap, Daily Agenda, Streak, Quick Launcher |
| **AI Daily Blueprint Planner** | `/planner` | 🟢 Complete | Cognitive load balancing, scheduled breaks, topic decomposition |
| **Immersive Focus Mode & Workspace** | `/focus` | 🟢 Complete | Pause-audited state machine, YouTube study beats, on-device camera |
| **Post-Session Reflection Flow** | `/focus` modal | 🟢 Complete | Self-rating (1-5), distraction logs, points ledger credit |
| **Conversational AI Coach** | `/ai-coach` | 🟢 Complete | Real user context injection, suggested action triggers |
| **Productivity & Focus Analytics** | `/analytics` | 🟢 Complete | Recharts graphs, planned vs actual, subject distribution, JSON export |
| **Deterministic Rewards Engine** | `/rewards` | 🟢 Complete | 50h, 100h, 200h, 500h Forge cards, auditable points ledger |
| **Timetable & Syllabus Parser** | `/resources` | 🟢 Complete | AI timetable text extraction, preview, calendar sync |
| **Google Drive Integration** | `/integrations` | 🟢 Complete | OAuth flow, narrow scopes, study file linking |
| **Settings & Privacy Controls** | `/settings` | 🟢 Complete | Target slider, coaching tone, camera toggle, account deletion |
| **User Profile Overview** | `/profile` | 🟢 Complete | Lifetime hours, active goals, registered learning areas |

---

## 🧪 Automated Testing

Focus Forge includes an automated test runner verifying critical business logic:
- Exact duration calculations excluding pause intervals.
- Cumulative pause event aggregation.
- Deterministic reward points calculations (+10 pts / focus minute).
- Idempotency key uniqueness to prevent duplicate credits.
- Milestone hour unlock thresholds (50h, 100h, 200h, 500h).
- Heatmap color intensity bins.
- AI timetable parser schedule extraction.

```bash
npm run test
```

---

## 🛡️ Security & Privacy Architecture

1. **On-Device Attention Cues**: All camera focus estimation runs locally inside the browser using client-side canvas heuristics. No video stream is ever saved or transmitted to any server.
2. **Deterministic Points Ledger**: Points cannot be arbitrarily granted; each award requires an idempotency key tied to a completed session.
3. **Narrow OAuth Scopes**: Google Drive integrations only request read-only access to user-selected documents.
4. **Data Portability**: Users can export their full dataset as JSON or cascade-purge their account at any time.

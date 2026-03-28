# RedBlue — Autonomous Red Team Agent Dashboard

A cinematic, multi-page Next.js + Tailwind CSS dashboard showcasing an AI-driven red-teaming system with a human-in-the-loop fix-and-retest loop.

---

## 🗂 Project Structure

```
redblue-dashboard/
├── app/
│   ├── layout.tsx              ← Root layout (Navbar + Footer)
│   ├── globals.css             ← Global styles, CSS variables, animations
│   ├── page.tsx                ← Home / Landing page
│   ├── dashboard/
│   │   └── page.tsx            ← Main dashboard (status + flow stepper)
│   ├── red-report/
│   │   └── page.tsx            ← Red Agent vulnerability report
│   ├── fix-suggestions/
│   │   └── page.tsx            ← Blue Agent fixes + approval UI
│   ├── logs/
│   │   └── page.tsx            ← Timeline / narrative log with auto-play
│   └── future-scaling/
│       └── page.tsx            ← Roadmap / scaling slide page
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   └── demoData.ts             ← All hard-coded demo data (JSON)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd redblue-dashboard
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm start
```

---

## 📄 Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, feature cards, CTA |
| `/dashboard` | Dashboard | Status card, flow stepper, action buttons, endpoint preview |
| `/red-report` | Red Report | Vulnerability cards with LLM reasoning toggle |
| `/fix-suggestions` | Fix Suggestions | Blue agent fix cards with apply/apply-all state |
| `/logs` | Logs | Animated timeline with auto-play button |
| `/future-scaling` | Roadmap | Agent architecture diagram + scaling cards |

---

## 🎨 Design System

- **Fonts**: [Syne](https://fonts.google.com/specimen/Syne) (display/body) + [Space Mono](https://fonts.google.com/specimen/Space+Mono) (code/labels)
- **Theme**: Dark terminal aesthetic (`#090b10` base), red/blue/green accent system
- **Components**: `.glass-card`, `.badge-red/blue/green/yellow`, `.btn-red/blue/ghost`
- **Animations**: Scanline overlay, pulse dots, fade-up reveals, timeline auto-play

---

## 🔌 Swapping to Real API Calls

All demo data lives in `lib/demoData.ts`. To connect to a real backend:

1. Replace `redReport`, `blueSuggestions`, and `logs` exports with `fetch()` calls to your API
2. Add `"use client"` to pages that need live state
3. Use React `useEffect` + `useState` to load and manage async data
4. The UI components accept the same data shapes — no changes needed in components

Example:
```ts
// lib/demoData.ts  →  lib/api.ts
export async function getRedReport() {
  const res = await fetch('/api/red-report');
  return res.json();
}
```

---

## 🧩 Extending

- **Add a login page**: Create `app/login/page.tsx` with a form UI (no real auth needed for demo)
- **Add more vulnerabilities**: Push objects to the `redReport` array in `lib/demoData.ts`
- **Add more fix types**: Extend `blueSuggestions` with new entries
- **Connect to LLM**: Replace the static `reasoning` field with a live call to an LLM API in the red report page
# Portfolio — Dimitris Belias

## Stack
- Vite 6 + React 18 + Tailwind CSS v4
- Framer Motion — all animations and transitions
- Lenis — smooth scroll
- React Three Fiber + Drei + Three.js — 3D hero scene
- Single file: src/portfolio.jsx (keep everything here)
- Font: Syne (loaded via Google Fonts in index.css)

## Design System
- Background: #050507
- Accent: amber-400 (#f59e0b)
- Text: neutral-200 (headings), neutral-400 (body), neutral-500/600 (muted)
- Font: Syne for headings (extralight/light), monospace for labels

## Animation Rules
- Use Framer Motion for ALL transitions and reveals — no more CSS opacity/translate-y
- Standard variants: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
- Stagger children on grids: staggerChildren: 0.12
- Spring physics on hover: { type: "spring", stiffness: 300, damping: 20 }
- Scroll-triggered: use whileInView + viewport={{ once: true, margin: "-100px" }}
- DO NOT use the old useReveal hook — replace with Framer Motion whileInView

## Three.js Scene (Hero)
- Replace StarField canvas with a React Three Fiber scene
- Floating particle cloud, mouse parallax, amber color palette (#f59e0b)
- Keep CometCursor canvas as-is — it works fine
- Use @react-three/drei helpers (Points, PointMaterial, Float, etc.)

## Smooth Scroll
- Lenis initialized in main.jsx, RAF loop via useEffect
- Integrate with Framer Motion useScroll where needed

## Existing Components (keep structure, upgrade internals)
- CometCursor — keep as-is (canvas, works fine)
- Navbar — upgrade hover/active states to Framer Motion
- Hero — R3F particle scene replaces StarField, Framer Motion text reveals
- About — Framer Motion reveal, add CV download button + stat row
- ProjectCard + Projects — Framer Motion stagger grid, keep corner accent
- Skills — Framer Motion stagger, keep category structure
- TerminalHacker — keep as-is, it's interactive and works
- Footer — keep as-is
- ADD: Contact section before Footer

## Data Constants (do not restructure)
- PROJECTS, SKILLS, SOCIAL defined at top of portfolio.jsx
- Update PROJECTS[].link with real GitHub URLs when available

## What NOT to do
- Do not install shadcn/ui
- Do not split into multiple files unless asked
- Do not change the amber/dark color palette
- Do not remove CometCursor or TerminalHacker
- Do not use CSS keyframes or Tailwind transition classes for reveals — use Framer Motion

## Install Commands
npm install framer-motion lenis @react-three/fiber @react-three/drei three

## Dev / Deploy
- Dev: npm run dev
- Build: npm run build
- Deploy: push to main → Vercel auto-deploys
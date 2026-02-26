# Sprint Log — AdmitGuard

## Sprint 0 (Day 3 — Wednesday PM + Evening)
- **Goal:** Understand problem, plan approach, set up repo, research tools
- **Done:** Repo created, README written, wireframe sketched, researched AI Studio Build mode
- **Research:** Read official Futurense site, watched Vite + Vanilla JS tutorials, experimented with AI Studio interface
- **Blockers:** None
- **Key Decision:** Chose single-page form over multi-step wizard to keep the cognitive load low for rapid data entry.
- **Prompts Drafted:** 3 (Foundation, Strict Rules, Dashboard)

## Sprint 1 (Day 4 — Thursday PM + Evening)
- **Goal:** Working form with strict validation
- **Done:** All 11 fields rendering, 7 strict rules validated, Futurense UI foundation applied
- **Blockers:** Initial phone validation was too permissive; fixed with dedicated regex prompt.
- **Key Decision:** Used inline validation instead of submit-time validation for better UX.
- **Prompts Used:** 3 (Foundation, Strict Rules, Edge Cases)
- **AI Evaluation:** Prompt 1 output was 80% correct. Had to refine dropdown behavior manually.

## Sprint 2 (Day 5 — Friday AM)
- **Goal:** Soft rules and exception management
- **Done:** Implemented exception toggles, rationale validation (30 chars + keywords), and manager flagging.
- **Key Decision:** Required specific keywords in rationale to ensure auditors have enough context.

## Sprint 3 (Day 5 — Friday PM)
- **Goal:** Configurable rules engine and Backend Integration
- **Done:** Refactored logic to `rules.json`, set up Express + SQLite backend, migrated frontend to `fetch`.

## Sprint 4 (Day 5 Evening)
- **Goal:** Final polish and documentation
- **Done:** Completed Futurense UI redesign (true black dark mode), finalized README and Sprint Log.

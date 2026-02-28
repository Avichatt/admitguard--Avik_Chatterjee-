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
- **Blockers:** Managing the form state when users toggled exceptions on/off repeatedly required rewriting listener bindings to prevent memory leaks or incorrect flagging states.
- **Key Decision:** Required specific keywords in rationale to ensure auditors always receive adequate, structured context. 
- **Prompts Used:** 2 (Conditional logic schema, Manager Review ruleset).
- **AI Evaluation:** Highly effective at generating complex data structures, though regex needed manual testing for string length edge cases.

## Sprint 3 (Day 5 — Friday PM)
- **Goal:** Comprehensive UI Polish, Data Infrastructure & Analytics Dashboard
- **Done:** Formatted login page to mimic the Institutional branding (IIT Gandhinagar). Created the Data Grid/Registry to process candidate data. Constructed the Audit Log view. Implemented CSV/JSON native browser export functionalities.
- **Blockers:** Storing and synchronizing the relational audit trail between raw database entries and chronological timestamps proved fragile using `localStorage`. 
- **Key Decision:** Moved to a derived/computed audit log model pulling directly from Candidates data to ensure 100% data integrity between Registry and Trail.
- **Prompts Used:** 3 (Dashboard layout structure, Audit Trail schema mappings, Grid rendering pipelines).
- **AI Evaluation:** AI generated very clean HTML structures, though styling complex CSS grids required iterative adjustments.

## Sprint 4 (Day 5 Evening)
- **Goal:** Final functionality fixes, deep debugging & UX refinements
- **Done:** Solved the critical `<form>` label overlap with "STRICT/SOFT" semantic badges by removing them entirely. Restored full site-wide branding to "Admitguard". Completely refactored the Search functionalities in both Entries and Audit Log pages—integrating tokenization, `.every()` logic array sorting, and decoupling layout re-renders from text-input focus retention.
- **Blockers:** The search bar originally lost focus after typing a single letter due to immediate parent container DOM replacement.
- **Key Decision:** Hardcoded layout zones to guarantee zero-flicker behavior during string filtering and query matching. Allowed dynamic filtering based on Email and Phone inside visual audit streams.
- **Prompts Used:** 2 (React-style immutable rendering concepts adapted for Vanilla JS, string-tokenization matching algorithms).
- **AI Evaluation:** Excellent debugging intelligence. Synthesized partial matching strategies effortlessly and eliminated DOM thrashing immediately.

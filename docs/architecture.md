# Architecture & Data Flow

## Components
- **Rules Engine**: Parses `config/rules.json` to apply logic to form fields.
- **Form View**: Handles user input and displays validation state.
- **Dashboard**: Aggregates data from the SQLite backend for visual stats.
- **Audit Log**: Records all system events (submissions, flags, exceptions).

## Data Flow
1. User enters data → **Validator** checks against rules.
2. If invalid → Red status / Hard block (Strict) or Exception toggle (Soft).
3. On Submit → Data sent to **Express API**.
4. API persists to **SQLite** and logs the event in `audit_log` table.
5. Views fetch data from API via **Store** module.

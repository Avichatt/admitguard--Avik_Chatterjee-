import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'admitguard.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    exceptions TEXT,
    exception_count INTEGER DEFAULT 0,
    requires_manager_review INTEGER DEFAULT 0,
    system_flags TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

export default db;

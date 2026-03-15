import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/* ═══════════════════════════════════════════════════════════════ */
/*  ARGUS Intelligence Database                                     */
/*  SQLite via better-sqlite3 — embedded, zero-config               */
/* ═══════════════════════════════════════════════════════════════ */

const DB_PATH = path.join(process.cwd(), "data", "argus.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "lib", "database", "schema.sql");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  _db.exec(schema);

  return _db;
}

/* ─── Signal CRUD ─── */
export interface DbSignal {
  id: string;
  technology: string;
  cluster: string;
  title: string;
  summary: string | null;
  priority_score: number;
  trl: number;
  confidence: number;
  velocity: number;
  volatility: string;
  score_history: string;       // JSON
  priority_drivers: string;    // JSON
  impact_domains: string;      // JSON
  source_type: string;
  source_url: string | null;
  source_count: number;
  evidence_base: string | null;
  bottlenecks: string | null;
  strategic_notes: string | null;
  trend_direction: string;
  last_updated: string;
  created_at: string;
}

export function upsertSignal(signal: Partial<DbSignal> & { id: string }): void {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM signals WHERE id = ?").get(signal.id);

  if (existing) {
    const fields = Object.keys(signal).filter((k) => k !== "id" && k !== "created_at");
    if (fields.length === 0) return;
    const setClause = fields.map((k) => `${k} = @${k}`).join(", ");
    db.prepare(`UPDATE signals SET ${setClause}, last_updated = datetime('now') WHERE id = @id`).run(signal);
  } else {
    const keys = Object.keys(signal);
    const placeholders = keys.map((k) => `@${k}`).join(", ");
    db.prepare(`INSERT INTO signals (${keys.join(", ")}) VALUES (${placeholders})`).run(signal);
  }
}

export function getAllSignals(): DbSignal[] {
  return getDb().prepare("SELECT * FROM signals ORDER BY priority_score DESC").all() as DbSignal[];
}

export function getSignalsByCluster(cluster: string): DbSignal[] {
  return getDb().prepare("SELECT * FROM signals WHERE cluster = ? ORDER BY priority_score DESC").all(cluster) as DbSignal[];
}

export function getSignalCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) as cnt FROM signals").get() as { cnt: number };
  return row.cnt;
}

/* ─── Raw Sources ─── */
export function insertRawSource(fetcher: string, sourceUrl: string | null, title: string | null, rawData: string): number {
  const result = getDb().prepare(
    "INSERT INTO raw_sources (fetcher, source_url, title, raw_data) VALUES (?, ?, ?, ?)"
  ).run(fetcher, sourceUrl, title, rawData);
  return Number(result.lastInsertRowid);
}

export function markSourceProcessed(id: number): void {
  getDb().prepare("UPDATE raw_sources SET processed = 1 WHERE id = ?").run(id);
}

export function getUnprocessedSources(fetcher?: string): Array<{ id: number; fetcher: string; title: string | null; raw_data: string }> {
  if (fetcher) {
    return getDb().prepare("SELECT id, fetcher, title, raw_data FROM raw_sources WHERE processed = 0 AND fetcher = ?").all(fetcher) as Array<{ id: number; fetcher: string; title: string | null; raw_data: string }>;
  }
  return getDb().prepare("SELECT id, fetcher, title, raw_data FROM raw_sources WHERE processed = 0").all() as Array<{ id: number; fetcher: string; title: string | null; raw_data: string }>;
}

/* ─── Ingestion Log ─── */
export function logIngestion(fetcher: string, recordsFound: number, signalsCreated: number, signalsUpdated: number, durationMs: number, error?: string): void {
  getDb().prepare(
    "INSERT INTO ingestion_log (fetcher, records_found, signals_created, signals_updated, duration_ms, error) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(fetcher, recordsFound, signalsCreated, signalsUpdated, durationMs, error || null);
}

export function getRecentIngestionLogs(limit = 20): Array<{ fetcher: string; records_found: number; signals_created: number; run_at: string }> {
  return getDb().prepare("SELECT fetcher, records_found, signals_created, signals_updated, duration_ms, error, run_at FROM ingestion_log ORDER BY run_at DESC LIMIT ?").all(limit) as Array<{ fetcher: string; records_found: number; signals_created: number; run_at: string }>;
}

/* ─── Alerts ─── */
export interface DbAlert {
  id: number;
  alert_type: string;
  technology: string;
  cluster: string | null;
  severity: string;
  confidence: number;
  metric: string | null;
  value: string | null;
  data: string | null;
  acknowledged: number;
  created_at: string;
}

export function insertAlert(alert: Omit<DbAlert, "id" | "created_at" | "acknowledged">): number {
  const result = getDb().prepare(
    `INSERT INTO alerts (alert_type, technology, cluster, severity, confidence, metric, value, data)
     VALUES (@alert_type, @technology, @cluster, @severity, @confidence, @metric, @value, @data)`
  ).run(alert);
  return Number(result.lastInsertRowid);
}

export function getActiveAlerts(limit = 50): DbAlert[] {
  return getDb().prepare("SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY created_at DESC LIMIT ?").all(limit) as DbAlert[];
}

export function acknowledgeAlert(id: number): void {
  getDb().prepare("UPDATE alerts SET acknowledged = 1 WHERE id = ?").run(id);
}

/* ─── Seed from static JSON ─── */
export function seedFromStaticData(): { seeded: number } {
  const db = getDb();
  const count = getSignalCount();
  if (count > 0) return { seeded: 0 };

  // Load static intelligence.json
  const staticPath = path.join(process.cwd(), "data", "intelligence.json");
  if (!fs.existsSync(staticPath)) return { seeded: 0 };

  const raw = JSON.parse(fs.readFileSync(staticPath, "utf-8"));
  let seeded = 0;

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO signals (id, technology, cluster, title, summary, priority_score, trl, confidence, velocity, volatility,
      score_history, priority_drivers, impact_domains, source_type, source_count, evidence_base, bottlenecks, strategic_notes, trend_direction)
    VALUES (@id, @technology, @cluster, @title, @summary, @priority_score, @trl, @confidence, @velocity, @volatility,
      @score_history, @priority_drivers, @impact_domains, @source_type, @source_count, @evidence_base, @bottlenecks, @strategic_notes, @trend_direction)
  `);

  const transaction = db.transaction(() => {
    for (const sig of raw) {
      const history = sig.scoreHistory || [];
      const scores = history.map((h: { score: number }) => h.score);
      const velocity = scores.length >= 2 ? (scores[scores.length - 1] - scores[scores.length - 2]) * 100 : 0;

      insertStmt.run({
        id: sig.id,
        technology: sig.signal,
        cluster: sig.technologyCluster || "Unknown",
        title: sig.signal,
        summary: sig.strategicNotes || null,
        priority_score: typeof sig.priorityScore === "number" && sig.priorityScore <= 1 ? sig.priorityScore * 100 : (sig.priorityScore || 0),
        trl: sig.trl || 1,
        confidence: sig.confidence || 0,
        velocity,
        volatility: sig.volatility || "stable",
        score_history: JSON.stringify(sig.scoreHistory || []),
        priority_drivers: JSON.stringify(sig.priorityDrivers || []),
        impact_domains: JSON.stringify(sig.impactDomains || []),
        source_type: "static",
        source_count: sig.sourceCount || 1,
        evidence_base: sig.evidenceBase || null,
        bottlenecks: sig.bottlenecks || null,
        strategic_notes: sig.strategicNotes || null,
        trend_direction: sig.trendDirection || "stable",
      });
      seeded++;
    }
  });

  transaction();
  return { seeded };
}

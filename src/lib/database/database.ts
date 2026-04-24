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

/* ─── Phase-22: Normalized Actor & Momentum Schema ─── */

export interface ExtractedActorsData {
  authors: string[];
  organizations: string[];
  country: string;
  technology: string;
  sourceType: string;
  sourceId: string;
}

export function insertTechnologyActors(actors: ExtractedActorsData): void {
  const db = getDb();

  const insertOrg = db.prepare(`
    INSERT INTO organizations (name, country, type)
    VALUES (?, ?, ?)
    RETURNING id
  `);

  const findOrg = db.prepare(`
    SELECT id FROM organizations WHERE name = ?
  `);

  const insertResearcher = db.prepare(`
    INSERT INTO researchers (name, organization_id, country)
    VALUES (?, ?, ?)
  `);

  const insertTechActor = db.prepare(`
    INSERT INTO technology_actors (technology, organization_id, country, source_type, source_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const orgIds: number[] = [];

    // Process organizations
    for (const orgName of actors.organizations) {
      if (!orgName || orgName === "Unknown") continue;
      
      let orgRow = findOrg.get(orgName) as { id: number } | undefined;
      if (!orgRow) {
        // Infer type heuristically
        let type = "company";
        const upper = orgName.toUpperCase();
        if (upper.includes("UNIV") || upper.includes("INSTITUTE") || upper.includes("COLLEGE") || upper.includes("MIT") || upper.includes("IIT")) type = "university";
        else if (upper.includes("GOV") || upper.includes("MINISTRY") || upper.includes("AGENCY") || upper.includes("AUTHORITY") || upper.includes("NASA")) type = "government";
        
        // Infer country roughly inside India/Unknown for now unless passed explicitly
        orgRow = insertOrg.get(orgName, actors.country, type) as { id: number };
      }
      orgIds.push(orgRow.id);

      // Link actor
      insertTechActor.run(actors.technology, orgRow.id, actors.country, actors.sourceType, actors.sourceId);
    }

    // Process researchers (authors)
    for (const authorName of actors.authors) {
      if (!authorName) continue;
      const orgId = orgIds.length > 0 ? orgIds[0] : null; // Link to first org if possible
      insertResearcher.run(authorName, orgId, actors.country);
    }
  });

  transaction();
}

export function updateMomentumScoresCore(technology: string, country: string, isResearch: boolean, isPatent: boolean, citations: number): void {
  const db = getDb();
  const year = new Date().getFullYear();

  db.prepare(`
    INSERT INTO technology_momentum (technology, country, year, research_count, patent_count, citation_count, momentum_score)
    VALUES (?, ?, ?, ?, ?, ?, 0.0)
    ON CONFLICT(technology, country, year)
    DO UPDATE SET
      research_count = research_count + excluded.research_count,
      patent_count = patent_count + excluded.patent_count,
      citation_count = citation_count + excluded.citation_count
  `).run(technology, country, year, isResearch ? 1 : 0, isPatent ? 1 : 0, citations);
}

export interface DbActorOutput {
  name: string;
  country: string;
  output_count: number;
}

export interface DbMomentumAggregate {
  country: string;
  momentum: number;
}

export function getAllMomentumScores(): Array<{ id: number, technology: string, country: string, research_count: number, patent_count: number, citation_count: number, momentum_score: number }> {
    return getDb().prepare("SELECT * FROM technology_momentum").all() as Array<{ id: number, technology: string, country: string, research_count: number, patent_count: number, citation_count: number, momentum_score: number }>;
}

export function setMomentumScore(id: number, score: number): void {
    getDb().prepare("UPDATE technology_momentum SET momentum_score = ? WHERE id = ?").run(score, id);
}

export function getTopOrganizations(conceptName: string): DbActorOutput[] {
  return getDb().prepare(`
    SELECT o.name, o.country, COUNT(ta.id) as output_count
    FROM organizations o
    JOIN technology_actors ta ON o.id = ta.organization_id
    WHERE ta.technology = ?
    GROUP BY o.id
    ORDER BY output_count DESC
    LIMIT 5
  `).all(conceptName) as DbActorOutput[];
}

export function getMomentumAggregated(conceptName: string): DbMomentumAggregate[] {
  return getDb().prepare(`
    SELECT country, MAX(momentum_score) as momentum
    FROM technology_momentum
    WHERE technology = ?
    GROUP BY country
  `).all(conceptName) as DbMomentumAggregate[];
}

/* ─── Phase-23: Emerging Signals ─── */

export interface DbEmergingSignal {
  id: number;
  technology: string;
  first_detected: string;
  early_signal_score: number;
  publication_growth: number;
  novelty_score: number;
  cross_domain_links: number;
  status: string;
  updated_at: string;
  created_at: string;
}

export function upsertEmergingSignal(signal: {
  technology: string;
  early_signal_score: number;
  publication_growth: number;
  novelty_score: number;
  cross_domain_links: number;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO emerging_signals (technology, first_detected, early_signal_score, publication_growth, novelty_score, cross_domain_links, updated_at)
    VALUES (?, date('now'), ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(technology)
    DO UPDATE SET
      early_signal_score = excluded.early_signal_score,
      publication_growth = excluded.publication_growth,
      novelty_score = excluded.novelty_score,
      cross_domain_links = excluded.cross_domain_links,
      updated_at = datetime('now'),
      status = CASE
        WHEN excluded.early_signal_score >= 0.7 THEN 'confirmed'
        WHEN excluded.early_signal_score < 0.3 THEN 'faded'
        ELSE 'emerging'
      END
  `).run(
    signal.technology,
    signal.early_signal_score,
    signal.publication_growth,
    signal.novelty_score,
    signal.cross_domain_links
  );
}

export function getEmergingSignals(limit = 20): DbEmergingSignal[] {
  return getDb().prepare(
    "SELECT * FROM emerging_signals WHERE status != 'faded' ORDER BY early_signal_score DESC LIMIT ?"
  ).all(limit) as DbEmergingSignal[];
}

export function getAllTrackedTechnologies(): Array<{ technology: string; year: number; research_count: number; patent_count: number }> {
  return getDb().prepare(`
    SELECT technology, year, SUM(research_count) as research_count, SUM(patent_count) as patent_count
    FROM technology_momentum
    GROUP BY technology, year
    ORDER BY technology, year
  `).all() as Array<{ technology: string; year: number; research_count: number; patent_count: number }>;
}

export interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'allocator' | 'analyst';
  display_name: string | null;
}

export function getUserByEmail(email: string): DbUser | null {
  const row = getDb()
    .prepare("SELECT id, email, password_hash, role, display_name FROM users WHERE email = ?")
    .get(email.toLowerCase()) as DbUser | undefined;
  return row ?? null;
}

export function upsertUser(
  email: string,
  passwordHash: string,
  role: 'admin' | 'allocator' | 'analyst',
  displayName: string
): void {
  getDb()
    .prepare(`
      INSERT INTO users (email, password_hash, role, display_name)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        role = excluded.role,
        display_name = excluded.display_name
    `)
    .run(email.toLowerCase(), passwordHash, role, displayName);
}

export function updateLastLogin(userId: number): void {
  getDb()
    .prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?")
    .run(userId);
}


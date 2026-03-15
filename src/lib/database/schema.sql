-- ARGUS Intelligence Database Schema
-- SQLite via better-sqlite3

CREATE TABLE IF NOT EXISTS signals (
  id            TEXT PRIMARY KEY,
  technology    TEXT NOT NULL,
  cluster       TEXT NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  priority_score REAL DEFAULT 0,
  trl           INTEGER DEFAULT 1,
  confidence    REAL DEFAULT 0,
  velocity      REAL DEFAULT 0,
  volatility    TEXT DEFAULT 'stable',
  score_history TEXT DEFAULT '[]',          -- JSON array
  priority_drivers TEXT DEFAULT '[]',       -- JSON array
  impact_domains TEXT DEFAULT '[]',         -- JSON array
  source_type   TEXT DEFAULT 'unknown',     -- arxiv, patent, news, crossref
  source_url    TEXT,
  source_count  INTEGER DEFAULT 1,
  evidence_base TEXT,
  bottlenecks   TEXT,
  strategic_notes TEXT,
  trend_direction TEXT DEFAULT 'stable',
  last_updated  TEXT DEFAULT (datetime('now')),
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS raw_sources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  fetcher     TEXT NOT NULL,               -- arxiv, crossref, patent, news
  source_url  TEXT,
  title       TEXT,
  raw_data    TEXT,                         -- JSON blob
  processed   INTEGER DEFAULT 0,           -- 0/1
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ingestion_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  fetcher         TEXT NOT NULL,
  records_found   INTEGER DEFAULT 0,
  signals_created INTEGER DEFAULT 0,
  signals_updated INTEGER DEFAULT 0,
  duration_ms     INTEGER DEFAULT 0,
  error           TEXT,
  run_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type   TEXT NOT NULL,              -- velocity_spike, breakout, cluster_surge, momentum_accel
  technology   TEXT NOT NULL,
  cluster      TEXT,
  severity     TEXT NOT NULL,              -- CRITICAL, WARNING, WATCH
  confidence   REAL DEFAULT 0,
  metric       TEXT,
  value        TEXT,
  data         TEXT,                        -- JSON blob with extra details
  acknowledged INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signals_cluster ON signals(cluster);
CREATE INDEX IF NOT EXISTS idx_signals_priority ON signals(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_trl ON signals(trl);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_sources_processed ON raw_sources(processed);

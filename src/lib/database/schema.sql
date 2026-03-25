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

-- Phase-22: Normalized Actor & Momentum Schema
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT,
  type TEXT, -- university, company, government
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS researchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  organization_id INTEGER,
  country TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS technology_actors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT NOT NULL,
  organization_id INTEGER,
  country TEXT,
  source_type TEXT, -- paper, patent, news
  source_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS technology_momentum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT NOT NULL,
  country TEXT NOT NULL,
  year INTEGER NOT NULL,
  research_count INTEGER DEFAULT 0,
  patent_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  momentum_score REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(technology, country, year)
);

CREATE TABLE IF NOT EXISTS organization_leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT,
  organization_id INTEGER,
  paper_count INTEGER,
  patent_count INTEGER,
  citation_count INTEGER,
  momentum_score REAL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ═══════════════════════════════════════════════════════════════
-- Production Indexes (Phase-25)
-- Optimized for high-frequency query patterns at 1M+ records
-- ═══════════════════════════════════════════════════════════════

-- Signals: core lookup patterns
CREATE INDEX IF NOT EXISTS idx_signals_cluster ON signals(cluster);
CREATE INDEX IF NOT EXISTS idx_signals_priority ON signals(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_trl ON signals(trl);
CREATE INDEX IF NOT EXISTS idx_signals_technology ON signals(technology);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source_type ON signals(source_type);
CREATE INDEX IF NOT EXISTS idx_signals_tech_cluster ON signals(technology, cluster);

-- Alerts: severity + unacknowledged fast path
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unack ON alerts(acknowledged, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_technology ON alerts(technology);

-- Raw Sources: ingestion pipeline fast paths
CREATE INDEX IF NOT EXISTS idx_raw_sources_processed ON raw_sources(processed);
CREATE INDEX IF NOT EXISTS idx_raw_sources_fetcher ON raw_sources(fetcher, processed);
CREATE INDEX IF NOT EXISTS idx_raw_sources_created ON raw_sources(created_at DESC);

-- Ingestion Log: analytics
CREATE INDEX IF NOT EXISTS idx_ingestion_fetcher ON ingestion_log(fetcher);
CREATE INDEX IF NOT EXISTS idx_ingestion_run_at ON ingestion_log(run_at DESC);

-- Organizations: dedup lookups
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);

-- Technology Actors: actor queries
CREATE INDEX IF NOT EXISTS idx_actor_technology ON technology_actors(technology);
CREATE INDEX IF NOT EXISTS idx_actor_country ON technology_actors(country);
CREATE INDEX IF NOT EXISTS idx_actor_org ON technology_actors(organization_id);
CREATE INDEX IF NOT EXISTS idx_actor_tech_country ON technology_actors(technology, country);

-- Momentum: composite for aggregation queries
CREATE INDEX IF NOT EXISTS idx_momentum_technology ON technology_momentum(technology);
CREATE INDEX IF NOT EXISTS idx_momentum_tech_year ON technology_momentum(technology, year);
CREATE INDEX IF NOT EXISTS idx_momentum_country ON technology_momentum(country);

-- Organization Leaders: ranking queries
CREATE INDEX IF NOT EXISTS idx_leaders_technology ON organization_leaders(technology);

-- Phase-23: Early Technology Emergence Detection
CREATE TABLE IF NOT EXISTS emerging_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT NOT NULL,
  first_detected DATE NOT NULL,
  early_signal_score REAL DEFAULT 0.0,
  publication_growth REAL DEFAULT 0.0,
  novelty_score REAL DEFAULT 0.0,
  cross_domain_links INTEGER DEFAULT 0,
  status TEXT DEFAULT 'emerging',  -- emerging, confirmed, faded
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(technology)
);

CREATE INDEX IF NOT EXISTS idx_emerging_score ON emerging_signals(early_signal_score DESC);
CREATE INDEX IF NOT EXISTS idx_emerging_status ON emerging_signals(status);

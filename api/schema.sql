CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  api_token_hash TEXT UNIQUE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS accounts_username_lower_idx
ON accounts (LOWER(username));

CREATE TABLE xp_events (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  skill TEXT NOT NULL,
  xp_gained INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

CREATE TABLE xp_baselines (
  account_id UUID REFERENCES accounts(id),
  skill TEXT NOT NULL,
  xp INTEGER NOT NULL,
  captured_at TIMESTAMP NOT NULL,
  PRIMARY KEY (account_id, skill)
);

CREATE TABLE xp_goals (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  skill TEXT NOT NULL,
  target_xp INTEGER NOT NULL,
  target_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gear_snapshots (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  timestamp TIMESTAMP NOT NULL,
  slots JSONB NOT NULL
);

CREATE TABLE boss_kc (
  account_id UUID REFERENCES accounts(id),
  boss TEXT NOT NULL,
  kc INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  PRIMARY KEY (account_id, boss)
);

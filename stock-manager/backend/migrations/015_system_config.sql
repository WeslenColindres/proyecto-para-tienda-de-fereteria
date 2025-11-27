CREATE TABLE IF NOT EXISTS system_configs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default session duration (8 hours in minutes)
INSERT INTO system_configs (key, value, description)
VALUES ('session_duration_minutes', '480', 'Duration of user session in minutes')
ON CONFLICT (key) DO NOTHING;

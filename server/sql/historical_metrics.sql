-- Modify the computed_value table to support historical metrics
-- Since the 'key' has a UNIQUE constraint, we need to change how we store historical values
ALTER TABLE computed_value DROP CONSTRAINT computed_value_key_key;

-- Create a new index to maintain fast lookups by key
CREATE INDEX computed_value_key_idx ON computed_value(key);

-- Create a new table to track historical snapshots
CREATE TABLE metrics_snapshot
(
    id               SERIAL PRIMARY KEY,
    snapshotId       UUID UNIQUE  NOT NULL,
    snapshotDate     DATE UNIQUE  NOT NULL,
    description      TEXT         NOT NULL,
    createdTimestamp TIMESTAMP    NOT NULL
);

-- Helper function to create historical computed value keys
CREATE OR REPLACE FUNCTION create_historical_key(base_key TEXT, snapshot_date DATE) 
RETURNS TEXT AS $$
BEGIN
    RETURN base_key || '__' || to_char(snapshot_date, 'YYYY_MM_DD');
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily get historical metrics for agencies
CREATE OR REPLACE VIEW historical_agency_metrics AS
SELECT 
    ms.snapshotDate,
    a.name as agencyName,
    a.slug as agencySlug,
    cv.key,
    cv.data
FROM 
    metrics_snapshot ms
    CROSS JOIN agency a
    LEFT JOIN computed_value cv ON cv.key LIKE 'agency-metrics__' || a.agencyId || '__' || to_char(ms.snapshotDate, 'YYYY_MM_DD')
ORDER BY 
    ms.snapshotDate, a.name;

-- Create a view to easily get historical title metrics
CREATE OR REPLACE VIEW historical_title_metrics AS
SELECT 
    ms.snapshotDate,
    cv.key,
    cv.data
FROM 
    metrics_snapshot ms
    LEFT JOIN computed_value cv ON cv.key = 'global-title-metrics__' || to_char(ms.snapshotDate, 'YYYY_MM_DD')
ORDER BY 
    ms.snapshotDate; 
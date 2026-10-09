-- Day 8 Query Optimization
-- Create indexes to optimize the specific queries used by the metrics endpoints

-- TRS query optimization: (port_id, arrival_time) already exists, but we can add release_time
CREATE INDEX IDX_SHIP_TRS_OPT ON shipments(port_id, arrival_time, release_time);

-- Revenue queries often join hs_codes and filter on port_id and arrival_time
-- A covering index could be:
CREATE INDEX IDX_SHIP_REV_OPT ON shipments(port_id, arrival_time, hs_code, declared_value, tax_collected);

-- Enforcement queries filter on arrival_time, port_id, and group by inspection_status
CREATE INDEX IDX_SHIP_ENF_OPT ON shipments(port_id, arrival_time, inspection_status);

-- Org Metrics filters on port_id and metric_month
CREATE INDEX IDX_ORG_METRIC_OPT ON org_metrics(port_id, metric_month);

-- Alerts query often filters by status, severity, and sorts by created_at
CREATE INDEX IDX_ALERT_OPT ON alerts(status, severity, created_at);

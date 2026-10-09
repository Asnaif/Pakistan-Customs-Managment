CREATE TABLE ports (
    port_id INT AUTO_INCREMENT PRIMARY KEY,
    port_name VARCHAR(100) NOT NULL UNIQUE,
    location_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX IDX_PORT_NAME ON ports(port_name);

CREATE TABLE hs_codes (
    hs_code VARCHAR(10) PRIMARY KEY,
    description TEXT NOT NULL,
    standard_tax_rate DECIMAL(5,2) NOT NULL,
    historical_avg_value DECIMAL(15,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    port_id INT NOT NULL,
    hs_code VARCHAR(10) NOT NULL,
    declared_value DECIMAL(15,2) NOT NULL,
    tax_collected DECIMAL(15,2) NOT NULL,
    arrival_time DATETIME NOT NULL,
    release_time DATETIME NULL,
    inspection_status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (port_id) REFERENCES ports(port_id),
    FOREIGN KEY (hs_code) REFERENCES hs_codes(hs_code)
);
CREATE INDEX IDX_SHIP_ARRIVAL ON shipments(arrival_time);
CREATE INDEX IDX_SHIP_PORT_ARR ON shipments(port_id, arrival_time);
CREATE INDEX IDX_SHIP_HS_ARR ON shipments(hs_code, arrival_time);
CREATE INDEX IDX_SHIP_STATUS_ARR ON shipments(inspection_status, arrival_time);
CREATE INDEX IDX_SHIP_PORT_STATUS_ARR ON shipments(port_id, inspection_status, arrival_time);

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
CREATE INDEX IDX_USER_EMAIL ON users(email);

CREATE TABLE user_ports (
    user_id INT NOT NULL,
    port_id INT NOT NULL,
    PRIMARY KEY (user_id, port_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (port_id) REFERENCES ports(port_id) ON DELETE CASCADE
);

CREATE TABLE kpi_rules (
    rule_id VARCHAR(50) PRIMARY KEY,
    metric_code VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    threshold_value DECIMAL(15,2) NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id INT NULL,
    severity VARCHAR(20) NOT NULL,
    active_from DATETIME NULL,
    active_to DATETIME NULL,
    enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL,
    metric_code VARCHAR(50) NOT NULL,
    observed_value DECIMAL(15,2) NOT NULL,
    threshold_value DECIMAL(15,2) NOT NULL,
    scope_id INT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME NULL,
    FOREIGN KEY (rule_id) REFERENCES kpi_rules(rule_id)
);
CREATE INDEX IDX_ALERT_STATUS ON alerts(status, created_at);

CREATE TABLE audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NULL,
    metadata_json JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE kpi_targets (
    target_id INT AUTO_INCREMENT PRIMARY KEY,
    metric_code VARCHAR(50) NOT NULL,
    target_value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id INT NULL
);

CREATE TABLE org_metrics (
    port_id INT NOT NULL,
    metric_month VARCHAR(7) NOT NULL, /* YYYY-MM */
    officers_on_duty INT NOT NULL DEFAULT 0,
    training_hours INT NOT NULL DEFAULT 0,
    system_uptime_pct DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    backlog_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (port_id, metric_month),
    FOREIGN KEY (port_id) REFERENCES ports(port_id) ON DELETE CASCADE
);

"""
Customs PMM Dashboard — Deterministic Data Generator
SRS §21: 50,000 shipments, 6+ ports, 24 months, seeded anomalies.

Usage:
  python generate_data.py
"""

import random
import hashlib
from datetime import datetime, timedelta

# ── Configuration ───────────────────────────────────────
SEED = 42
TOTAL_SHIPMENTS = 50000
MONTHS = 24  # Jan 2025 – Dec 2026
START_DATE = datetime(2025, 1, 1)
ANOMALY_THRESHOLD_PCT = 50  # for deterministic fixtures
NUM_VALUATION_ANOMALIES = 25  # at least 20 per SRS §21.4
NUM_LONG_RELEASES = 25  # at least 20 > 72 hours
NUM_SEIZED = 15  # at least 10
NUM_INVALID_TIMESTAMPS = 5  # at least 5

random.seed(SEED)

# ── Reference Data ──────────────────────────────────────

PORTS = [
    ("Port Karachi",     "Seaport"),
    ("Port Qasim",       "Seaport"),
    ("Lahore Dry Port",  "Land Border"),
    ("Islamabad Airport","Airport"),
    ("Peshawar Border",  "Land Border"),
    ("Quetta Border",    "Land Border"),
    ("Gwadar Port",      "Seaport"),
    ("Sialkot Airport",  "Airport"),
]

# Synthetic HS codes with reference values and tax rates
HS_CODES = []
hs_categories = [
    ("010110", "Live horses", 5.0, 25000),
    ("020230", "Frozen bovine meat", 10.0, 8000),
    ("030389", "Frozen fish", 8.0, 5000),
    ("040210", "Milk powder", 12.0, 3000),
    ("060210", "Live plants and cuttings", 5.0, 1500),
    ("070190", "Fresh potatoes", 7.0, 800),
    ("080510", "Fresh oranges", 6.0, 1200),
    ("090111", "Coffee, not roasted", 10.0, 4500),
    ("100190", "Wheat", 5.0, 500),
    ("110100", "Wheat flour", 8.0, 700),
    ("120100", "Soybeans", 5.0, 900),
    ("130190", "Natural gums", 7.0, 2500),
    ("150710", "Soybean oil, crude", 12.0, 1800),
    ("170199", "Cane sugar", 15.0, 600),
    ("180100", "Cocoa beans", 8.0, 3500),
    ("190190", "Malt extract preparations", 10.0, 2000),
    ("200190", "Prepared vegetables", 12.0, 1500),
    ("210690", "Food preparations", 15.0, 2200),
    ("220300", "Beer", 20.0, 1000),
    ("230400", "Soybean oilcake", 5.0, 800),
    ("240120", "Tobacco, partly stemmed", 25.0, 5000),
    ("250100", "Salt", 5.0, 200),
    ("260111", "Iron ore", 3.0, 150),
    ("270900", "Petroleum oils, crude", 5.0, 70000),
    ("280461", "Silicon", 7.0, 15000),
    ("290243", "Styrene", 8.0, 2500),
    ("300490", "Medicaments", 5.0, 12000),
    ("310210", "Urea fertilizer", 5.0, 400),
    ("320419", "Synthetic dyes", 10.0, 8000),
    ("330499", "Cosmetic preparations", 15.0, 3000),
    ("340111", "Soap", 10.0, 1500),
    ("350300", "Gelatin", 8.0, 4000),
    ("360500", "Matches", 12.0, 500),
    ("370110", "X-ray photographic plates", 10.0, 6000),
    ("380891", "Insecticides", 8.0, 5000),
    ("390110", "Polyethylene", 7.0, 2000),
    ("400110", "Natural rubber", 5.0, 3000),
    ("410411", "Bovine leather", 10.0, 8000),
    ("420212", "Trunks and suitcases", 15.0, 5000),
    ("430110", "Mink furskins", 20.0, 25000),
    ("440710", "Coniferous lumber", 8.0, 1200),
    ("470329", "Chemical wood pulp", 5.0, 1500),
    ("480100", "Newsprint", 7.0, 900),
    ("490110", "Printed books", 0.0, 2000),
    ("500200", "Raw silk", 5.0, 15000),
    ("510111", "Greasy wool", 5.0, 8000),
    ("520100", "Cotton", 5.0, 2500),
    ("540110", "Synthetic sewing thread", 10.0, 3000),
    ("550110", "Synthetic filament tow", 8.0, 4000),
    ("560290", "Felt", 10.0, 2000),
    ("570110", "Wool carpets", 15.0, 6000),
    ("580110", "Woven pile fabrics", 12.0, 5000),
    ("590210", "Tire cord fabric", 8.0, 4500),
    ("600110", "Pile knitted fabrics", 12.0, 3500),
    ("610110", "Men's overcoats, knitted", 20.0, 4000),
    ("620111", "Men's overcoats, woven", 20.0, 5000),
    ("630120", "Blankets", 15.0, 2000),
    ("640110", "Waterproof footwear", 20.0, 3000),
    ("650100", "Hat forms", 15.0, 1500),
    ("680100", "Setts and flagstones", 8.0, 500),
    ("690100", "Bricks", 10.0, 300),
    ("700100", "Glass cullet", 5.0, 200),
    ("710210", "Unsorted diamonds", 5.0, 50000),
    ("720110", "Non-alloy pig iron", 5.0, 800),
    ("730110", "Sheet piling", 8.0, 1500),
    ("740110", "Copper matte", 5.0, 12000),
    ("750110", "Nickel matte", 5.0, 20000),
    ("760110", "Unwrought aluminum", 7.0, 3000),
    ("780110", "Unwrought lead", 5.0, 2500),
    ("790110", "Unwrought zinc", 5.0, 3000),
    ("800110", "Unwrought tin", 5.0, 25000),
    ("810194", "Unwrought tungsten", 5.0, 40000),
    ("820210", "Hand saws", 10.0, 1500),
    ("830110", "Padlocks", 12.0, 800),
    ("840110", "Nuclear reactors", 3.0, 500000),
    ("841011", "Hydraulic turbines", 5.0, 150000),
    ("842010", "Calendering machines", 8.0, 30000),
    ("843010", "Earth moving machines", 7.0, 80000),
    ("844010", "Bookbinding machinery", 8.0, 20000),
    ("845011", "Washing machines", 15.0, 5000),
    ("846011", "Surface grinding machines", 8.0, 25000),
    ("847010", "Electronic calculators", 10.0, 500),
    ("847130", "Portable computers", 10.0, 15000),
    ("848010", "Molding boxes", 8.0, 3000),
    ("850110", "Electric motors", 8.0, 8000),
    ("851610", "Electric water heaters", 12.0, 3000),
    ("852110", "Video recording apparatus", 10.0, 5000),
    ("852520", "Transmission apparatus", 8.0, 10000),
    ("853110", "Burglar alarms", 10.0, 2000),
    ("854011", "Television tubes", 10.0, 4000),
    ("860110", "Rail locomotives", 5.0, 200000),
    ("870110", "Pedestrian-controlled tractors", 8.0, 15000),
    ("871110", "Motorcycles", 20.0, 8000),
    ("880110", "Gliders", 5.0, 50000),
    ("890110", "Cruise ships", 3.0, 500000),
    ("900110", "Optical fibers", 8.0, 10000),
    ("901010", "Photo developing equipment", 10.0, 5000),
    ("910111", "Wrist watches", 15.0, 3000),
    ("920110", "Upright pianos", 12.0, 8000),
    ("930110", "Military weapons", 25.0, 30000),
    ("940110", "Seats for aircraft", 10.0, 5000),
]

for code, desc, rate, ref_val in hs_categories:
    HS_CODES.append((code, desc, rate, ref_val))

# Extend to reach ~200 HS codes
for i in range(100, 200):
    code = f"{i:06d}"
    desc = f"Synthetic commodity {i}"
    rate = round(random.uniform(3, 25), 2)
    ref_val = round(random.uniform(200, 100000), 2)
    HS_CODES.append((code, desc, rate, ref_val))

# ── Roles and Users ─────────────────────────────────────

ROLES = [
    (1, "National Auditor"),
    (2, "National Customs Analyst"),
    (3, "Port Manager"),
    (4, "Revenue Officer"),
    (5, "Enforcement Officer"),
    (6, "System Administrator"),
    (7, "Executive Viewer"),
]

# bcrypt hash for "Password123!" — pre-computed for seed data
# In production, each password would be unique and hashed at creation time
PASSWORD_HASH = "$2b$10$8.3ShMRlfU8eNj25Orfq6.x4.SjyVAE8Ege7Ax/9F.CXehC1T5o.i"

USERS = [
    ("admin@pmm.gov",          6, []),                # System Administrator — national scope
    ("auditor@pmm.gov",        1, []),                # National Auditor — national scope
    ("analyst@pmm.gov",        2, []),                # National Customs Analyst — national scope
    ("executive@pmm.gov",      7, []),                # Executive Viewer — national scope
    ("pm_karachi@pmm.gov",     3, [1]),               # Port Manager — Karachi only
    ("pm_qasim@pmm.gov",       3, [2]),               # Port Manager — Qasim only
    ("pm_lahore@pmm.gov",      3, [3]),               # Port Manager — Lahore only
    ("rev_karachi@pmm.gov",    4, [1]),               # Revenue Officer — Karachi
    ("rev_national@pmm.gov",   4, []),                # Revenue Officer — national
    ("enf_karachi@pmm.gov",    5, [1]),               # Enforcement Officer — Karachi
    ("enf_peshawar@pmm.gov",   5, [5]),               # Enforcement Officer — Peshawar
    ("pm_islamabad@pmm.gov",   3, [4]),               # Port Manager — Islamabad
    ("pm_peshawar@pmm.gov",    3, [5]),               # Port Manager — Peshawar
    ("pm_quetta@pmm.gov",      3, [6]),               # Port Manager — Quetta
    ("pm_gwadar@pmm.gov",      3, [7]),               # Port Manager — Gwadar
    ("pm_sialkot@pmm.gov",     3, [8]),               # Port Manager — Sialkot
]

# ── KPI Rules ───────────────────────────────────────────

KPI_RULES = [
    ("RULE-TRS-001", "AVG_CLEARANCE_HOURS", ">", 72, "NATIONAL", None, "Critical"),
    ("RULE-TRS-002", "AVG_CLEARANCE_HOURS", ">", 48, "NATIONAL", None, "Warning"),
    ("RULE-TRS-003", "AVG_CLEARANCE_HOURS", ">", 72, "PORT", 1, "Critical"),
    ("RULE-TRS-004", "AVG_CLEARANCE_HOURS", ">", 72, "PORT", 5, "Critical"),
    ("RULE-REV-001", "REVENUE_GAP_PCT", ">", 10, "NATIONAL", None, "Warning"),
    ("RULE-REV-002", "ANOMALY_COUNT", ">", 100, "NATIONAL", None, "Critical"),
    ("RULE-ENF-001", "SEIZURE_RATE", ">", 2, "NATIONAL", None, "Warning"),
    ("RULE-ENF-002", "FLAG_RATE", ">", 10, "NATIONAL", None, "Info"),
    ("RULE-ORG-001", "SYSTEM_UPTIME", "<", 95, "PORT", 1, "Warning"),
    ("RULE-ORG-002", "BACKLOG_COUNT", ">", 50, "PORT", 3, "Warning"),
]

# ── KPI Targets ─────────────────────────────────────────

KPI_TARGETS = [
    ("AVG_CLEARANCE_HOURS", 72, "hours", "monthly", "NATIONAL", None),
    ("TARGET_COMPLIANCE_PCT", 80, "%", "monthly", "NATIONAL", None),
    ("REVENUE_GAP_PCT", 5, "%", "monthly", "NATIONAL", None),
    ("SEIZURE_RATE", 1, "%", "monthly", "NATIONAL", None),
    ("SYSTEM_UPTIME", 99, "%", "monthly", "NATIONAL", None),
]

# ── Port weights (shipment distribution) ────────────────
# Karachi gets most traffic, smaller ports less
PORT_WEIGHTS = [35, 20, 12, 10, 8, 5, 5, 5]  # must sum to 100


def sql_escape(s):
    """Simple SQL string escaper."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def generate():
    lines = []
    lines.append("-- Customs PMM Dashboard — Seed Data")
    lines.append("-- Generated deterministically with seed=42")
    lines.append("-- SRS §21: 50,000 shipments, 8 ports, 200 HS codes, 24 months")
    lines.append("")
    lines.append("SET FOREIGN_KEY_CHECKS = 0;")
    lines.append("")

    # ── Ports ────────────────────────────────────────────
    lines.append("-- Ports")
    for i, (name, loc_type) in enumerate(PORTS, 1):
        lines.append(f"INSERT INTO ports (port_id, port_name, location_type) VALUES ({i}, '{sql_escape(name)}', '{loc_type}');")
    lines.append("")

    # ── HS Codes ─────────────────────────────────────────
    lines.append("-- HS Codes")
    for code, desc, rate, ref_val in HS_CODES:
        lines.append(f"INSERT INTO hs_codes (hs_code, description, standard_tax_rate, historical_avg_value) VALUES ('{code}', '{sql_escape(desc)}', {rate}, {ref_val});")
    lines.append("")

    # ── Roles ────────────────────────────────────────────
    lines.append("-- Roles")
    for role_id, role_name in ROLES:
        lines.append(f"INSERT INTO roles (role_id, role_name) VALUES ({role_id}, '{sql_escape(role_name)}');")
    lines.append("")

    # ── Users ────────────────────────────────────────────
    lines.append("-- Users (password for all: Password123!)")
    for idx, (email, role_id, ports) in enumerate(USERS, 1):
        lines.append(f"INSERT INTO users (user_id, email, password_hash, role_id) VALUES ({idx}, '{email}', '{PASSWORD_HASH}', {role_id});")
    lines.append("")

    # ── User-Port assignments ────────────────────────────
    lines.append("-- User-Port assignments")
    for idx, (email, role_id, ports) in enumerate(USERS, 1):
        for port_id in ports:
            lines.append(f"INSERT INTO user_ports (user_id, port_id) VALUES ({idx}, {port_id});")
    lines.append("")

    # ── KPI Rules ────────────────────────────────────────
    lines.append("-- KPI Rules")
    for rule_id, metric, op, threshold, scope_type, scope_id, severity in KPI_RULES:
        scope_val = "NULL" if scope_id is None else str(scope_id)
        lines.append(f"INSERT INTO kpi_rules (rule_id, metric_code, operator, threshold_value, scope_type, scope_id, severity) VALUES ('{rule_id}', '{metric}', '{op}', {threshold}, '{scope_type}', {scope_val}, '{severity}');")
    lines.append("")

    # ── KPI Targets ──────────────────────────────────────
    lines.append("-- KPI Targets")
    for idx, (metric, target, unit, period, scope_type, scope_id) in enumerate(KPI_TARGETS, 1):
        scope_val = "NULL" if scope_id is None else str(scope_id)
        lines.append(f"INSERT INTO kpi_targets (target_id, metric_code, target_value, unit, period_type, scope_type, scope_id) VALUES ({idx}, '{metric}', {target}, '{unit}', '{period}', '{scope_type}', {scope_val});")
    lines.append("")

    # ── Shipments ────────────────────────────────────────
    lines.append("-- Shipments (50,000)")

    # Pre-select anomaly and special indices
    all_indices = list(range(TOTAL_SHIPMENTS))
    random.shuffle(all_indices)
    valuation_anomaly_indices = set(all_indices[:NUM_VALUATION_ANOMALIES])
    long_release_indices = set(all_indices[NUM_VALUATION_ANOMALIES:NUM_VALUATION_ANOMALIES + NUM_LONG_RELEASES])
    seized_indices = set(all_indices[NUM_VALUATION_ANOMALIES + NUM_LONG_RELEASES:NUM_VALUATION_ANOMALIES + NUM_LONG_RELEASES + NUM_SEIZED])
    invalid_ts_indices = set(all_indices[NUM_VALUATION_ANOMALIES + NUM_LONG_RELEASES + NUM_SEIZED:NUM_VALUATION_ANOMALIES + NUM_LONG_RELEASES + NUM_SEIZED + NUM_INVALID_TIMESTAMPS])

    # Bottleneck port: Peshawar (port_id=5) will have higher release times
    BOTTLENECK_PORT_ID = 5

    for i in range(TOTAL_SHIPMENTS):
        shipment_id = f"SHP-{i+1:06d}"

        # Weighted port selection
        port_idx = random.choices(range(len(PORTS)), weights=PORT_WEIGHTS, k=1)[0]
        port_id = port_idx + 1

        # Random HS code
        hs_idx = random.randint(0, len(HS_CODES) - 1)
        hs_code, _, tax_rate, ref_val = HS_CODES[hs_idx]

        # Arrival time: spread across 24 months with slight seasonality
        month_offset = random.randint(0, MONTHS - 1)
        day = random.randint(1, 28)
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        arrival = START_DATE + timedelta(days=month_offset * 30 + day - 1, hours=hour, minutes=minute)

        # Declared value — normally distributed around reference
        if i in valuation_anomaly_indices:
            # Deterministic 50% anomaly (SRS §21.3)
            declared_value = round(ref_val * 0.50, 2)
        else:
            # Normal variation: 80%-120% of reference
            factor = random.gauss(1.0, 0.12)
            factor = max(0.5, min(1.5, factor))
            declared_value = round(ref_val * factor, 2)

        # Tax collected based on declared value
        tax_collected = round(declared_value * tax_rate / 100, 2)

        # Release time
        if i in invalid_ts_indices:
            # Invalid: release_time before arrival_time (SRS §21.4)
            release_hours = random.uniform(-10, -1)
            release_time = arrival + timedelta(hours=release_hours)
        elif i in long_release_indices:
            # Intentionally slow: >72 hours (SRS §21.4)
            release_hours = random.uniform(73, 200)
            release_time = arrival + timedelta(hours=release_hours)
        elif port_id == BOTTLENECK_PORT_ID:
            # Bottleneck port: higher average release time (SRS §21.4)
            release_hours = random.gauss(65, 25)
            release_hours = max(1, release_hours)
            release_time = arrival + timedelta(hours=release_hours)
        else:
            # Normal release: most within 72 hours
            release_hours = random.gauss(30, 18)
            release_hours = max(0.5, release_hours)
            release_time = arrival + timedelta(hours=release_hours)

        # Inspection status
        if i in seized_indices:
            inspection_status = "Seized"
        else:
            r = random.random()
            if r < 0.85:
                inspection_status = "Cleared"
            elif r < 0.95:
                inspection_status = "Flagged"
            else:
                inspection_status = "Seized"

        arrival_str = arrival.strftime("%Y-%m-%d %H:%M:%S")
        release_str = release_time.strftime("%Y-%m-%d %H:%M:%S")

        lines.append(
            f"INSERT INTO shipments (shipment_id, port_id, hs_code, declared_value, tax_collected, arrival_time, release_time, inspection_status) "
            f"VALUES ('{shipment_id}', {port_id}, '{hs_code}', {declared_value}, {tax_collected}, '{arrival_str}', '{release_str}', '{inspection_status}');"
        )

    lines.append("")

    # ── Org Metrics ──────────────────────────────────────
    lines.append("-- Organizational Metrics (per port per month)")
    for port_id in range(1, len(PORTS) + 1):
        for m in range(MONTHS):
            year = 2025 + (m // 12)
            month = (m % 12) + 1
            month_str = f"{year}-{month:02d}"
            officers = random.randint(15, 80)
            training = random.randint(10, 200)
            uptime = round(random.uniform(90, 100), 2)
            backlog = random.randint(0, 80)
            lines.append(
                f"INSERT INTO org_metrics (port_id, metric_month, officers_on_duty, training_hours, system_uptime_pct, backlog_count) "
                f"VALUES ({port_id}, '{month_str}', {officers}, {training}, {uptime}, {backlog});"
            )
    lines.append("")

    lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    lines.append("")
    lines.append("-- End of seed data")

    return "\n".join(lines)


if __name__ == "__main__":
    sql_content = generate()
    output_path = "../sql/02_seed_data.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"Successfully wrote seed data to {output_path}")


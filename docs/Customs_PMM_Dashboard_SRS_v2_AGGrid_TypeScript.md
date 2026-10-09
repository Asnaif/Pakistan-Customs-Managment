## SOFTWARE REQUIREMENTS SPECIFICATION

## Customs Performance Measurement Mechanism (PMM) Dashboard

B2G Customs Intelligence and Performance Analytics Platform

| Document Version | 2.0 |
| --- | --- |
| Status | Enhanced Baseline / Implementation Ready |
| Prepared Date | 05 October 2026 |
|   | React + TypeScript + Vite + AG Grid / Node.js + |
| Primary Stack | Express + TypeScript / MySQL |
|   | 50,000 simulated shipments over 24 months; scalable |
| Data Volume Target | to 10x prototype volume |

## Important positioning note

This project is a simulated, WCO-aligned performance analytics application for demonstration, learning, portfolio, and prototype purposes. It does not constitute an official WCO PMM implementation, certification, tariff determination service, or legal customs valuation system.


## 1. Document Control

| Item | Value |
| --- | --- |
| Document Title | Software Requirements Specification - Customs Performance |
|   | Measurement Mechanism (PMM) Dashboard |
| Document ID | PMM-SRS-001 |
| Version | 2.0 |
| Status | Enhanced Baseline / Implementation Ready |
| Prepared Date | 05 October 2026 |
| Primary Audience | Project Owner, Developers, QA Engineers, UI/UX Designers, |
|   | Technical Reviewers, Customs Domain Stakeholders |
| System Type | Business-to-Government (B2G) enterprise analytics dashboard |
| Deployment Model | Web application; cloud-ready |

## 1.1 Revision History

| Version | Date | Author/Owner | Change Summary |
| --- | --- | --- | --- |
|   |   |   | Initial complete SRS baseline |
| 1.0 | 05-Oct-2026 | Project Team | derived from the project |
|   |   |   | concept and current WCO |
|   |   |   | reference material. |
| 2.0 | 05-Oct-2026 | Project Team | Added React + TypeScript |
|   |   |   | + Vite, AG Grid data-grid |
|   |   |   | requirements, PMM-draft |
|   |   |   | enhancements, richer |
|   |   |   | TRS/revenue analytics, |
|   |   |   | organizational metrics, |
|   |   |   | scheduled rules, alert |
|   |   |   | auto-resolution, |
|   |   |   | deterministic simulation, |
|   |   |   | and expanded |
|   |   |   | acceptance criteria. |

## 1.2 Approval / Sign-Off

| Role | Name | Status |
| --- | --- | --- |
| Project Owner | TBD | Pending |
| Technical Lead | TBD | Pending |
| Domain Reviewer | TBD | Pending |
| QA Lead | TBD | Pending |

## 2. Table of Contents

- 01. 3. Introduction and Purpose

- 02. 4. Product Overview and Objectives

- 03. 5. Stakeholders and User Classes

- 04. 6. Scope

- 05. 7. Assumptions, Constraints, and Dependencies

- 06. 8. Functional Requirements

- 07. 9. PMM Dimension Requirements


## 3. Introduction and Purpose

## 3.1 Purpose

The purpose of this Software Requirements Specification (SRS) is to define the business, functional, data, interface, security, performance, and technical requirements for the Customs Performance Measurement Mechanism (PMM) Dashboard. The document is intended to provide a single implementation baseline for the

design and development team and to make the expected behavior of the platform measurable and testable. This revision additionally standardizes the implementation baseline on React + TypeScript + Vite, Node.js + Express + TypeScript, MySQL, AG Grid, typed API contracts, and the enhanced PMM-draft capabilities described in Section 8 and Section 21. The solution is designed as a centralized customs intelligence hub that transforms high-volume transactional

data into performance indicators, alerts, comparative views, and analytical findings. The platform will emulate the structure and decision-support intent of the World Customs Organization (WCO) Performance Measurement Mechanism while using simulated data and configurable business rules.

## WCO alignment

The WCO states that its PMM is structured around four dimensions of Customs performance: Trade Facilitation and Economic Competitiveness; Revenue Collection; Enforcement, Security and Protection of Society; and Organizational Development. The WCO PMM was endorsed by the WCO Council in June 2023. [1]

## 3.2 Project Context

Customs organizations process large volumes of declarations, cargo movements, inspections, valuations, tariff classifications, and release events. Decision-makers require timely evidence to identify delays, revenue leakage, enforcement anomalies, and organizational weaknesses. This project packages those use cases into an


enterprise-style dashboard so that a user can move from a national KPI view to a port, commodity, shipment, or anomaly level without manually processing raw transactional data.

## 3.3 Intended Use

- Demonstrate an end-to-end B2G analytics product using realistic customs workflows and relational data.

- Provide executives with national and port-level KPI visibility.

- Provide operational managers with Time-Release Study (TRS) bottleneck analysis.

- Provide revenue users with analytical valuation variance and theoretical-revenue gap analysis.

- Provide enforcement users with inspection, seizure, and anomaly indicators.

- Provide administrators with configurable KPI thresholds, roles, access scopes, and audit visibility.

- Serve as a portfolio-quality demonstration of SQL aggregation, REST APIs, RBAC, dashboard UX, data engineering, and enterprise analytics.

## 4. Product Overview and Objectives

## 4.1 Product Vision

The PMM Dashboard will convert customs operational data into a decision-oriented performance layer. The primary user journey is: select a scope and time period -> review KPI status -> identify an outlier -> drill into the responsible port/commodity/shipment -> understand the root cause -> record or communicate the required action.

## 4.2 Business Objectives

- Reduce the time required to understand national and terminal-level customs performance.

- Make clearance delays measurable and comparable across ports and periods.

- Highlight possible valuation anomalies using a configurable historical reference model.

- Surface enforcement outcomes such as flagged and seized declarations without requiring raw-data inspection.

- Provide role-sensitive access to national, regional, and terminal data.

- Create a single source of truth for calculated KPIs and threshold-based alerts.

- Demonstrate a scalable architecture capable of handling at least 50,000 transactional records in the initial prototype.

## 4.3 Success Metrics

| Metric | Target for prototype | Measurement |
| --- | --- | --- |
| API response time | <= 500 ms for common aggregated | 95th percentile under representative |
|   | dashboard queries | indexed workload |
| Dashboard usability | Key KPIs visible within one screen at | UX review / acceptance test |
|   | desktop resolution |   |
| Data generation | 50,000 shipments / 24 months | Record-count validation |
| RBAC enforcement | 0 cross-scope data leakage in security | Automated authorization test suite |
|   | tests |   |
| Anomaly detection | Known injected anomalies detected | Seeded anomaly test cases |
| TRS accuracy | Calculated duration matches source | Automated formula validation |
|   | timestamps |   |

## 5. Stakeholders and User Classes

| Role | Primary responsibilities | Data scope | Typical actions |
| --- | --- | --- | --- |
| National Auditor | National oversight, | All ports / national | Compare ports, inspect alerts, |
|   | comparative performance, |   | export reports |


| Role | Primary responsibilities | Data scope | Typical actions |
| --- | --- | --- | --- |
|   | review |   |   |
| National Customs Analyst | KPI analysis and trend | All ports / national | Analyze revenue, TRS, |
|   | interpretation |   | enforcement, trends |
| Port Manager | Operational management for | Assigned port(s) only | Review TRS, bottlenecks, |
|   | assigned terminal(s) |   | anomalies, local alerts |
| Revenue Officer | Revenue and valuation | Authorized port/national | Review theoretical revenue |
|   | analysis | scope | gap and valuation anomalies |
| Enforcement Officer | Risk and enforcement | Authorized scope | Review flagged/seized |
|   | performance |   | outcomes, anomaly lists |
| System Administrator | Configuration and | All system metadata | Manage users, roles, rules, |
|   | administration |   | ports, KPI thresholds |
| Executive Viewer | High-level management | Read-only national / assigned | View executive KPI scorecard |
|   | reporting | scope | and trends |

## 5.1 Role-to-Permission Matrix

|   | Dashboar |   |   | Enforcem | Org |   |   |   |   | Audit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Role | d | TRS | Revenue | ent | Develop | Alerts | Rules | Users | Exports | Logs |
|   |   |   |   |   | ment |   |   |   |   |   |
| National | R | R | R | R | R | R | RW | - | R | R |
| Auditor |   |   |   |   |   |   |   |   |   |   |
| National |   |   |   |   |   |   |   |   |   |   |
| Customs | R | R | R | R | R | R | R | - | R | R |
| Analyst |   |   |   |   |   |   |   |   |   |   |
| Port | R | RW | R | R | R | R | - | - | R | - |
| Manager |   |   |   |   |   |   |   |   |   |   |
| Revenue | R | R | RW | R | - | R | - | - | R | - |
| Officer |   |   |   |   |   |   |   |   |   |   |
| Enforcem | R | R | R | RW | - | R | - | - | R | - |
| ent Officer |   |   |   |   |   |   |   |   |   |   |
| System |   |   |   |   |   |   |   |   |   |   |
| Administr | R | R | R | R | R | RW | RW | RW | RW | R |
| ator |   |   |   |   |   |   |   |   |   |   |
| Executive | R | R | R | R | R | R | - | - | R | - |
| Viewer |   |   |   |   |   |   |   |   |   |   |

*Legend: R = Read, RW = Read/Write, - = No access. Final permissions must also respect port/terminal scope.*

## 6. Scope

## 6.1 In Scope

- Authentication and JWT-based authorization.

- Role-based access control with port-level and national-level data segregation.

- Executive dashboard with KPI cards, trends, comparisons, and status indicators.

- Trade Facilitation / TRS analytics based on arrival and release timestamps.

- Revenue analytics using actual tax, expected tariff rate, historical reference value, and analytical revenue gap.

- Enforcement analytics for inspection status, flagged declarations, and seizures.

- Organizational Development scorecard using configurable operational/administrative KPIs.

- Configurable thresholds and UI alerts.

- Shipment-level valuation anomaly table.

- Date and port filtering with dynamic refresh.

- CSV/XLSX/PDF-ready export architecture (CSV mandatory in prototype; other formats optional).

- Audit logging for security-sensitive and configuration actions.

- Synthetic data generation with deliberate anomalies for repeatable testing.


## 6.2 Out of Scope for the Initial Prototype

- Live integration with a national customs declaration system or production customs single window.

- Official tariff determination or legal customs valuation decisions.

- Real-time vessel/aircraft GPS tracking.

- Direct payment processing or banking integration.

- Biometric identity management.

- Machine-learning models trained on real customs data.

- Automated enforcement decisions or automatic seizure orders.

## 7. Assumptions, Constraints, and Dependencies

## 7.1 Assumptions

- The shipment dataset is simulated and may intentionally contain anomalies for demonstration.

- The system will start with a fixed 24-month data window but must allow future dates and additional records.

- Each shipment has one primary port and one primary HS code in the simplified transactional model.

- Arrival time precedes or equals release time for valid released shipments.

- The historical average value is an analytical reference benchmark, not an official customs valuation determination.

- Tax rates are stored as configurable master data and may vary by jurisdiction in a production extension.

## 7.2 Technical Constraints

- Primary relational database: MySQL 8.x or compatible managed MySQL service.

- Backend: Node.js with Express.js and JWT middleware.

- Frontend: React + TypeScript + Vite. Next.js is optional only if deployment/routing requirements justify it; the baseline implementation shall remain React + TypeScript.

- Visualization: Recharts or Nivo; AG Grid for high-volume analytical tables.

- Styling: Tailwind CSS or MUI. Global state: Redux Toolkit or equivalent typed state layer for authentication and cross-module filters. Global state: Redux Toolkit or equivalent typed state layer for authentication and cross-module filters.

- Version control: Git/GitHub. Frontend and backend source shall use TypeScript with strict type checking where applicable. Frontend and backend source shall use TypeScript with strict type checking where applicable.

- API style: REST/JSON with typed request/response DTOs and centralized API contract types.

- Target desktop viewport for first release: 1366 x 768 and above; responsive support required for tablet layouts.

## 7.3 Dependencies

- Node.js runtime and package registry access.

- MySQL server and credentials.

- JWT secret or signing key.

- Seed/configuration datasets for ports, HS codes, users, roles, and KPI rules.

- WCO reference material for conceptual PMM mapping and TRS methodology.


## 8. Functional Requirements

## 8.1 Authentication and Session Management

## FR-AUTH-001 | Login | Must

The system shall provide a username/email and password login form and authenticate against the application user store.

## FR-AUTH-002 | JWT issuance | Must

On successful authentication, the backend shall issue a signed JWT containing user identity, role, and/or role reference plus an expiry time.

## FR-AUTH-003 | JWT validation | Must

Protected API routes shall reject missing, malformed, expired, or invalid tokens with HTTP 401.

## FR-AUTH-004 | Authorization | Must

The system shall apply role and scope checks before executing queries that return protected data.

## FR-AUTH-005 | Logout | Must

The frontend shall clear session state on logout. Token invalidation/rotation may be added through refresh-token strategy in production.

## FR-AUTH-006 | Password storage | Must

Passwords shall never be stored in plaintext and shall be hashed using a modern password hashing algorithm such as Argon2id or bcrypt.

## 8.2 Executive Dashboard

## FR-DASH-001 | KPI cards | Must

Display configurable summary KPIs including YTD revenue, average clearance time, shipment volume, anomaly count, flagged count, and seizure count.

## FR-DASH-002 | Trend charts | Must

Display time-series trends at monthly or daily granularity depending on selected date range.

## FR-DASH-003 | Port comparison | Must

Allow authorized users to compare selected ports on key indicators.

## FR-DASH-004 | KPI status | Must

Display Normal, Warning, and Critical state based on configured thresholds or target ranges.

## FR-DASH-005 | Drill-down | Must

Clicking a KPI/chart element shall navigate to a filtered analytical detail view.

## FR-DASH-006 | Global filters | Must

Selected date range, port, location type, HS code, and inspection status shall be consistently applied across supported dashboard modules.

## FR-DASH-007 | Executive scorecard | Must

Display Total Revenue (YTD), Analytical Revenue Gap %, National Average Clearance Time, Seizure Rate, Open Alerts, and shipment volume as the default executive scorecard.

## FR-DASH-008 | Live refresh indicator | Should

Display the last data refresh timestamp and support configurable polling (prototype default 60 seconds) without requiring a full page reload.

## 8.3 Trade Facilitation / TRS

## FR-TRS-001 | Average release time | Must

Calculate average elapsed time between arrival_time and release_time for valid released shipments.


## FR-TRS-002 | Port aggregation | Must

Group TRS metrics by port, month, and optionally location_type.

## FR-TRS-003 | Distribution metrics | Must

Provide at least average, median, minimum, maximum, and percentile-capable architecture; P50/P90 recommended.

## FR-TRS-004 | Bottleneck segmentation | Must

Allow analysis by port and time period; future extension may include process-stage timestamps.

## FR-TRS-005 | Outlier handling | Must

Support configurable outlier rules; abnormal negative durations shall be excluded and logged as data-quality errors.

## FR-TRS-006 | Target comparison | Must

Compare port or national averages against configurable targets such as 72 hours.

FR-TRS-007 | Release-time distribution buckets | Should Display release-time distribution buckets such as <6h, 6-24h, 24-72h, and >72h to complement mean/median/P90

metrics. FR-TRS-008 | Bottleneck ranking | Should Rank ports by average release time and identify configured bottleneck ports for management review.

## 8.4 Revenue Collection

## FR-REV-001 | Actual revenue | Must

Calculate total tax_collected over the selected filter scope.

## FR-REV-002 | Reference value | Must

Retrieve hs_codes.historical_avg_value for analytical comparison with declared value.

## FR-REV-003 | Theoretical revenue | Must

Calculate an estimated theoretical revenue using the configurable analytical reference value multiplied by the standard tax rate.

## FR-REV-004 | Revenue gap | Must

Calculate the non-negative difference between theoretical revenue and actual tax collected for reporting purposes.

## FR-REV-005 | Valuation anomaly | Must

Flag records whose declared value deviates from the historical reference value by a configurable percentage threshold.

## FR-REV-006 | Anomaly detail | Must

Provide shipment ID, port, HS code, declared value, reference value, deviation percentage, tax collected, estimated revenue, and gap.

FR-REV-007 | Revenue-gap ranking | Should Provide a ranked view of the top 10 HS codes and/or ports contributing the largest analytical revenue gaps. FR-REV-008 | Secondary anomaly signal | Could Optionally calculate a z-score of declared value within an HS-code peer group and expose it as a secondary

review signal without replacing the primary configurable deviation rule.

## 8.5 Enforcement and Security

## FR-ENF-001 | Status counts | Must

Aggregate shipments by inspection_status.

## FR-ENF-002 | Flag rate | Must

Calculate flagged shipments as a proportion of total shipments in scope.

## FR-ENF-003 | Seizure rate | Must

Calculate seized shipments as a proportion of total shipments in scope.


## FR-ENF-004 | Trend analysis | Must

Display monthly flagged/seized trends.

## FR-ENF-005 | Port comparison | Must

Compare enforcement outcomes by port with appropriate volume normalization.

## FR-ENF-006 | Normalized interception effectiveness | Should

Provide normalized enforcement views so high-volume ports are not interpreted as inherently higher risk solely because they process more declarations.

## 8.6 Organizational Development

## FR-ORG-001 | Operational scorecard | Must

Provide an extensible scorecard for organizational indicators such as data completeness, alert response time, report freshness, system availability, or training completion where those datasets are configured.

## FR-ORG-002 | Targets | Must

Allow administrators to configure target values and threshold rules for organizational KPIs.

## FR-ORG-003 | Trend view | Must

Show organizational KPI performance over time.

## FR-ORG-004 | Scope enforcement | Must

Apply the same RBAC and port scoping rules where organizational indicators are location-specific.

FR-ORG-005 | Per-port monthly operational indicators | Should

Store and display officers on duty, training hours, system uptime percentage, and backlog count by port and month when those datasets are configured.

## 8.7 Dynamic Rule Engine and Alerts

## FR-RULE-001 | Rule definition | Must

Administrators shall define rules with KPI name, operator, threshold, severity, scope, active dates, and enabled status.

## FR-RULE-002 | Continuous evaluation | Must

Rules shall be evaluated whenever relevant analytics are refreshed or at a configurable scheduled interval.

## FR-RULE-003 | Alert creation | Must

A breached rule shall create an alert record with a timestamp, affected scope, observed value, threshold, and status.

## FR-RULE-004 | Severity | Must

Supported severities shall include Info, Warning, and Critical.

## FR-RULE-005 | Acknowledgement | Must

Authorized users shall be able to acknowledge alerts without changing the underlying KPI data.

## FR-RULE-006 | Deduplication | Must

The engine shall avoid generating duplicate alerts for the same rule, scope, KPI, and evaluation window unless a configurable re-alert interval has elapsed.

## FR-RULE-007 | Scheduled evaluation | Must

Evaluate active rules on a configurable scheduler; prototype default is every 5 minutes over a rolling evaluation window.

## FR-RULE-008 | Rule editor permissions | Must

Authorized Rule Managers shall create, edit, enable, and disable KPI rules. The prototype shall permit National Auditors and System Administrators to perform rule management, subject to audit logging.


FR-RULE-009 | Auto-resolution | Should

An alert may automatically transition to Resolved when the monitored KPI returns to the configured compliant range, while preserving the full alert history.

FR-RULE-010 | Alert panel | Must

The notification panel shall display unread/open counts and shall enforce the same port scope as the underlying KPI.

## 8.8 Administration

## FR-ADM-001 | User management | Must

Administrators shall create, deactivate, and update users subject to authorization constraints.

FR-ADM-002 | Role assignment | Must

Administrators shall assign roles to users.

## FR-ADM-003 | Port scope | Must

Administrators shall associate Port Managers and scoped users with one or more permitted ports.

## FR-ADM-004 | KPI configuration | Must

Administrators shall maintain KPI targets, thresholds, and display status rules.

FR-ADM-005 | Master data | Must

Administrators shall manage ports and HS code reference records through protected CRUD operations.

## FR-ADM-006 | Audit log | Must

Administrative changes shall be written to the audit log.

## 8.9 Search, Filter, Drill-Down, and Export

## FR-UX-001 | Date range | Must

The user shall be able to select a start and end date.

## FR-UX-002 | Port selector | Must

The port selector shall show only ports authorized for the current user.

## FR-UX-003 | HS filter | Must

Authorized users shall be able to filter by HS code or HS description.

## FR-UX-004 | Server-side filtering | Must

For large datasets, filter parameters shall be passed to the API and evaluated in SQL rather than downloaded and filtered in the browser.

## FR-UX-005 | Export | Must

The system shall provide export of visible analytical tables to CSV; XLSX/PDF may be added as phase-two enhancements.

## FR-UX-006 | Empty states | Must

Charts and tables shall show a clear no-data state rather than blank components.

## 9. PMM Dimension Requirements

## Dimension mapping

The following module labels are intentionally aligned to the current WCO PMM dimension wording while preserving the simplified four-module structure proposed for the project. [1]

| WCO PMM dimension | Dashboard module | Core prototype measures |
| --- | --- | --- |
| Trade Facilitation and Economic | Trade Facilitation / TRS | Average release time, median release |
| Competitiveness |   | time, P90, volume, target compliance |


| WCO PMM dimension | Dashboard module | Core prototype measures |
| --- | --- | --- |
|   |   | Actual tax, reference value variance, |
| Revenue Collection | Revenue Intelligence | theoretical revenue, analytical revenue |
|   |   | gap |
| Enforcement, Security and Protection of | Enforcement & Security | Flagged, cleared, seized, flag/seizure |
| Society |   | rates, trends |
|   |   | Configurable organizational KPIs, target |
| Organizational Development | Organizational Scorecard | compliance, alert-response or data- |
|   |   | quality measures |

## 9.1 Trade Facilitation and Economic Competitiveness

The trade facilitation module shall emphasize cargo release speed, predictability, and comparison across entry points. The WCO describes TRS as a methodology for measuring the time required from arrival of goods to physical release and using the results to identify bottlenecks and improvement measures. The current WCO site lists TRS Guide Version 4 (2025). [2]

- Measure elapsed release time in hours.

- Aggregate monthly and port-level statistics.

- Highlight ports exceeding configured targets.

- Show trend direction and period-over-period change.

- Allow drill-down from a national metric to port and shipment evidence.

## 9.2 Revenue Collection

The revenue module uses a simulated analytical benchmark. It is specifically intended to demonstrate data analytics rather than to replace statutory customs valuation methods. The benchmark is derived from historical averages stored in the HS code master data and is combined with a configurable standard tax rate.

## 9.3 Enforcement, Security and Protection of Society

The enforcement module aggregates operational outcomes and provides normalized indicators so that a high- volume port is not automatically interpreted as a higher-risk port solely because it has more declarations.

## 9.4 Organizational Development

The organizational-development module is deliberately extensible. Because the simplified transactional schema does not yet contain staff, training, process maturity, or technology service data, the initial implementation shall use configurable KPI records rather than inventing unsupported operational facts.

## 10. Advanced Analytics Requirements

## 10.1 Predictive Valuation and Revenue Analytics

For each shipment, the system shall compare the declared value with the historical reference value associated with the HS code. The calculation is an analytical anomaly-detection model and should not be presented as a legally binding valuation assessment.

| Metric | Formula | Purpose |
| --- | --- | --- |
| Valuation deviation % | ((Reference Value - Declared Value) / | Measures how far declared value falls |
|   | Reference Value) x 100 | below/above the analytical benchmark. |
| Estimated theoretical revenue | Reference Value x (Standard Tax Rate / | Estimates revenue using the benchmark |
|   | 100) | instead of the declared value. |
| Revenue gap | MAX(0, Estimated Theoretical Revenue - | Highlights an analytical shortfall. |
|   | Actual Tax Collected) |   |
| Anomaly flag | Deviation % >= configurable threshold | Identifies candidate records for review. |


## Example

If a simulated HS code has a reference value of 100,000, a declared value of 50,000, and a standard tax rate of 10%, the dashboard can show a 50% valuation deviation and an analytical theoretical-revenue estimate of 10,000. The record is then flagged when the configured anomaly threshold is <= 50%.

## 10.2 Time-Release Study Analytics

The TRS module shall compute release durations from timestamps and support monthly, port, and national views. The WCO emphasizes segmentation, structured time-interval analysis, trend analysis, and outlier management in its updated TRS methodology. [2]

| Metric | Definition | Display |
| --- | --- | --- |
| Average clearance time | Arithmetic mean of valid durations | KPI card + line chart |
| Median / P50 | 50th percentile of valid durations | KPI card/table |
| P90 | 90th percentile of valid durations | KPI card/table |
| Fastest release | Minimum valid duration | Detail/table |
| Slowest release | Maximum valid duration | Detail/table |
| Target compliance | % of releases within target hours | KPI/benchmark |

## 10.3 Dynamic Rule Engine

| Field | Description | Example |
| --- | --- | --- |
| rule_id | Unique rule identifier | RULE-TRS-001 |
| metric_code | Metric being monitored | AVG_CLEARANCE_HOURS |
| operator | Comparison operator | > |
| threshold_value | Numeric threshold | 72 |
| scope_type | National or port | PORT |
| scope_id | Applicable scope identifier | 12 |
| severity | Info/Warning/Critical | Critical |
| active_from / active_to | Rule validity period | 2026-01-01 to NULL |
| enabled | Activation flag | true |

## 11. Business Rules and KPI Definitions

| Rule ID | Business rule |
| --- | --- |
|   | A released shipment must have release_time >= arrival_time; |
| BR-001 | invalid records are excluded from performance calculations |
|   | and written to a data-quality log. |
|   | A valuation anomaly threshold is configurable; the prototype |
| BR-002 | default is 30% and test fixtures must include at least one 50% |
|   | anomaly. |
| BR-003 | Theoretical revenue is an analytical estimate and must be |
|   | labeled as such in the UI. |
| BR-004 | Port-scoped users may only query records belonging to their |
|   | authorized ports. |
| BR-005 | National users may view all authorized national entry points. |
| BR-006 | KPIs must show the selected date range and filter scope to |
|   | prevent interpretation errors. |
| BR-007 | Threshold alerts are created from configured rules, not hard- |
|   | coded UI conditions. |
| BR-008 | Shipment-level financial values are rounded to two decimal |
|   | places for display; aggregation uses full database precision. |
| BR-009 | Empty result sets return valid JSON with zero/empty collections |
|   | and a descriptive message where appropriate. |
| BR-010 | Exported data must apply the same authorization scope as |
|   | interactive queries. |


## 11.1 KPI Dictionary

| KPI Code | KPI | Definition | Unit | Direction |
| --- | --- | --- | --- | --- |
| KPI-TRS-01 | Average Release Time | Mean elapsed time | Hours | Lower is better |
|   |   | from arrival to release |   |   |
| KPI-TRS-02 | P90 Release Time | 90th percentile elapsed | Hours | Lower is better |
|   |   | time |   |   |
|   |   | Releases completed |   |   |
| KPI-TRS-03 | Target Compliance | within configured | % | Higher is better |
|   |   | target |   |   |
| KPI-REV-01 | Actual Revenue | Sum of tax collected | Currency | Higher is context- |
|   |   |   |   | dependent |
|   | Valuation Anomaly | Number of declarations |   | Lower is typically |
| KPI-REV-02 | Count | exceeding deviation | Count | better |
|   |   | threshold |   |   |
|   |   | Estimated benchmark |   |   |
| KPI-REV-03 | Analytical Revenue Gap | revenue less actual tax | Currency | Lower is better |
|   |   | collected when positive |   |   |
| KPI-ENF-01 | Flag Rate | Flagged shipments / | % | Context-dependent |
|   |   | total shipments |   |   |
| KPI-ENF-02 | Seizure Rate | Seized shipments / total | % | Context-dependent |
|   |   | shipments |   |   |
|   |   | Valid populated |   |   |
| KPI-ORG-01 | Data Completeness | records / expected | % | Higher is better |
|   |   | records |   |   |

## 12. User Interface and UX Requirements

## 12.1 Global Layout

- Persistent left sidebar with four PMM dimension modules and administration options based on role.

- Top header containing application title/breadcrumbs, global date filter, port selector, user identity, role badge, and notifications.

- Main workspace using responsive cards, charts, and tables.

- Consistent status language: Normal, Warning, Critical.

- All charts must provide tooltips and a visible legend where multiple series are present.

## 12.2 Required Screens

| Screen | Primary content | Key interactions |
| --- | --- | --- |
| Login | Authentication form, error messages | Login, show/hide password, validation |
| National Dashboard | KPI cards, trend charts, port comparison, | Date/port filters, drill-down |
|   | active alerts |   |
| TRS Analysis | Release-time trend, port comparison, | Time period, port, export |
|   | distribution summary |   |
| Revenue Intelligence | Revenue cards, anomaly chart, anomaly | HS filter, threshold, drill-down |
|   | table |   |
| Enforcement | Flag/seizure counts, rates, trends | Status/port/date filters |
| Organizational Scorecard | Configured operational KPIs and target | KPI selection, period filter |
|   | status |   |
| Alerts Center | Open/acknowledged/closed alerts | Filter, acknowledge, view rule |
| Administration | Users, ports, HS codes, KPI rules, | CRUD subject to RBAC |
|   | thresholds |   |
| Audit Log | Administrative and security events | Date/action/user filters |


## 12.3 Loading, Empty, and Error States

## 12.4 AG Grid Data-Grid Requirements

- Use AG Grid as the standard tabular component for shipment data, valuation anomalies, alerts, audit logs, users, and other high-volume administrative/detail lists.

- AG Grid shall support server-backed pagination, sorting, filtering, column resizing, column visibility controls, row selection, and CSV export for permitted datasets.

- Filters applied in AG Grid shall map to backend query parameters; authorization and filtering shall be enforced in SQL/API services rather than relying on browser-only filtering.

- Grid definitions shall be strongly typed with TypeScript row models, column definitions, and response DTOs. Avoid untyped any values except documented integration boundaries.

- Financial columns shall use appropriate numeric formatting; timestamps shall render consistently with the system timezone policy while source timestamps remain UTC.

- Anomaly grids shall visually distinguish flagged severity/review state using text, icons, or badges so status does not depend on color alone.

- Grid loading shall use skeleton/overlay states; empty datasets shall show a descriptive empty state; API failures shall show retry actions.

- Use skeleton cards and chart placeholders for initial loading.

- Use inline retry controls for recoverable API failures.

- Use explicit empty-state messaging when filters produce no records.

- Never show raw SQL errors or stack traces to end users.

- Show the last refresh timestamp for data-driven dashboard views.

## 13. System Architecture

## 13.1 Three-Tier Architecture

| Layer | Technology | Responsibilities |
| --- | --- | --- |
|   | React + TypeScript + Vite + | Typed UI, routing, global filter |
|   | Tailwind/MUI + AG Grid + | state, role-aware navigation, |
| Presentation |   | analytical tables, charts, |
|   | Recharts/Nivo | accessibility |
|   |   | Authentication, authorization, |
|   | Node.js + Express.js + TypeScript | validation, business rules, |
| Application |   | aggregation API orchestration, |
|   |   | scheduled jobs, audit events |
|   |   | Relational storage, indexing, joins, |
| Data | MySQL 8.x | GROUP BY aggregations, transactional |
|   |   | integrity |

## 13.2 Logical Architecture

| Component | Inputs | Outputs | Notes |
| --- | --- | --- | --- |
| Auth Controller | Credentials | JWT / auth result | JWT-based session security |
| RBAC Middleware | JWT claims + route + scope | Authorized request context | Must execute before protected |
|   |   |   | queries |
| KPI Service | Filters + user scope | Aggregated KPI JSON | Centralizes KPI formulas |
| TRS Service | Shipment timestamps | TRS metrics | Uses indexed date/port |
|   |   |   | columns |
| Revenue Service | Shipments + HS master | Revenue and anomaly metrics Analytical, not legal valuation |   |
| Enforcement Service | Inspection statuses | Counts/rates/trends | Volume-normalized views |


| Component | Inputs | Outputs | Notes |
| --- | --- | --- | --- |
| Rule Engine | KPI results + rules | Alerts | Supports |
|   |   |   | severity/deduplication |
| Audit Service | Action context | Audit records | Captures admin/security |
|   |   |   | changes |
| MySQL | Transactional + master data | Query results | Primary system of record for |
|   |   |   | prototype |

## 13.3 Data Flow

User -> React UI -> Axios/fetch -> Express Route -> JWT/RBAC Middleware -> KPI/Domain Service -> SQL Query -> MySQL

|

+-> Audit / Rule Evaluation -> Alert Store

MySQL Aggregation -> JSON KPI Payload -> React State -> Charts / Tables / KPI Cards


## 13.4 Recommended Project Structure

## 13.5 TypeScript Implementation Standards

- Frontend source shall use .ts and .tsx files with strict compiler settings enabled where compatible with dependencies.

- Backend controllers, services, repositories, validators, jobs, and route handlers shall use TypeScript types/interfaces for request payloads, query parameters, domain objects, and service outputs.

- API response DTOs used by the React client shall be represented by shared TypeScript types or generated/validated contracts so KPI cards, charts, and AG Grid rows remain synchronized with backend payloads.

- Use discriminated unions/enums for role names, alert status, severity, inspection status, and KPI state values where practical.

- ESLint and Prettier shall enforce consistent TypeScript/React style; CI shall fail on type errors and lint failures.

- Use a typed API service layer instead of calling fetch/Axios directly from every page component.


```
generate_shipments.py
docs/
SRS
API
README.md
```

## 14. Data Architecture and Database Design

## 14.1 Core Entities

| Entity | Purpose | Cardinality |
| --- | --- | --- |
| ports | Customs entry points / terminals | 1 port -> many shipments |
| hs_codes | Commodity classification and analytical | 1 HS -> many shipments |
|   | tariff/reference data |   |
| shipments | Primary transactional customs | Many per port and HS code |
|   | declaration/cargo record |   |
| users | Application identities | Many users |
| roles | Authorization definitions | Many users -> one or more roles, |
|   |   | implementation may start one role/user |
| user_ports | Port-level access scope | Many-to-many users/ports |
| kpi_rules | Configurable KPI thresholds | Many rules per KPI/scope |
| alerts | Generated threshold breach records | Many alerts per rule |
| audit_logs | Security/admin traceability | Many events |

## 14.2 Core Table: ports

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| port_id | INT | PK, AUTO_INCREMENT | Unique port identifier |
| port_name | VARCHAR(100) | NOT NULL, UNIQUE | Customs entry point name |
| location_type | VARCHAR(50) | NOT NULL | Seaport, Airport, Land Border |
| is_active | BOOLEAN | DEFAULT TRUE | Soft availability flag |
| created_at | DATETIME | NOT NULL | Record creation time |
| updated_at | DATETIME | NOT NULL | Last modification time |

## 14.3 Core Table: hs_codes

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
|   |   |   | HS master identifier; |
| hs_code | VARCHAR(10) | PK | prototype may use 6-digit |
|   |   |   | codes |
| description | TEXT | NOT NULL | Commodity description |
| standard_tax_rate | DECIMAL(5,2) | NOT NULL | Analytical standard tariff/tax |
|   |   |   | percentage |
| historical_avg_value | DECIMAL(15,2) | NOT NULL | Analytical historical reference |
|   |   |   | value |
| currency_code | CHAR(3) | DEFAULT configurable | Currency of reference value |
|   |   | currency |   |
| is_active | BOOLEAN | DEFAULT TRUE | Master data status |

## HS code note

The WCO Harmonized System uses a six-digit international commodity classification structure, with national tariff schedules potentially extending or adapting classification and rates. For this prototype, the HS master is synthetic and should not be represented as an authoritative national tariff schedule. [4]


## 14.4 Core Table: shipments

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| shipment_id | VARCHAR(50) | PK | Unique declaration/tracking |
|   |   |   | identifier |
| port_id | INT | FK -> ports.port_id, INDEX | Customs point |
| hs_code | VARCHAR(10) | FK -> hs_codes.hs_code, | Commodity classification |
|   |   | INDEX |   |
| declared_value | DECIMAL(15,2) | NOT NULL | Importer-declared value |
| tax_collected | DECIMAL(15,2) | NOT NULL | Actual tax collected in |
|   |   |   | simulated data |
| arrival_time | DATETIME | INDEX, NOT NULL | Cargo arrival timestamp |
| release_time | DATETIME | INDEX, NULLABLE | Cargo release timestamp; null |
|   |   |   | when not released |
| inspection_status | VARCHAR(20) | INDEX, NOT NULL | Cleared, Flagged, Seized |
| created_at | DATETIME | NOT NULL | Ingestion time |

## 14.5 Supporting Tables

| Table | Key fields | Purpose |
| --- | --- | --- |
| users | user_id, email, password_hash, role_id, | Identity and authentication |
|   | status |   |
| roles | role_id, role_name | Role catalog |
| user_ports | user_id, port_id | Port-scope assignment |
|   | rule_id, metric_code, operator, |   |
| kpi_rules | threshold_value, scope_type, scope_id, | Dynamic thresholds |
|   | severity, enabled |   |
|   | alert_id, rule_id, metric_code, |   |
| alerts | observed_value, threshold_value, | Alert lifecycle |
|   | scope_id, severity, status, created_at, |   |
|   | acknowledged_at |   |
|   | audit_id, user_id, action, entity_type, |   |
| audit_logs | entity_id, metadata_json, ip_address, | Traceability |
|   | created_at |   |
| kpi_targets | target_id, metric_code, target_value, unit, | KPI target library |
|   | period_type, scope_type, scope_id |   |
| org_metrics | port_id, metric_month, | Monthly per-port organizational |
|   | officers_on_duty, training_hours, | and operational indicators |
|   | system_uptime_pct, backlog_count |   |

## 14.6 Indexing Strategy

| Index | Columns | Reason |
| --- | --- | --- |
| IDX_SHIP_ARRIVAL | shipments(arrival_time) | Date-range filtering and TRS aggregation |
| IDX_SHIP_PORT_ARR | shipments(port_id, arrival_time) | Port + date dashboard filters |
| IDX_SHIP_HS_ARR | shipments(hs_code, arrival_time) | HS + time revenue analytics |
| IDX_SHIP_STATUS_ARR | shipments(inspection_status, | Enforcement counts by period |
|   | arrival_time) |   |
| IDX_PORT_NAME | ports(port_name) | Port lookup |
| IDX_USER_EMAIL | users(email) | Login lookup |
| IDX_ALERT_STATUS | alerts(status, created_at) | Active alert center |
| IDX_SHIP_PORT_STATUS_ARR | shipments(port_id, | Scoped enforcement tables and AG |
|   | inspection_status, arrival_time) | Grid detail feeds |

| Performance caveat |
| --- |
| The 500 ms value is a design target, not a guarantee. Validate it with representative load testing before release. |


## 15. API Requirements

## 15.1 API Conventions

All analytical list endpoints consumed by AG Grid shall support server-side pagination, sorting, and filtering through validated query parameters such as page, pageSize, sortBy, sortDir, filterModel, startDate, endDate, portId, hsCode, and inspectionStatus. The backend shall return totalRows or an equivalent pagination total so the grid can render accurate navigation.

For the prototype, AG Grid shall use a server-backed/infinite data access pattern so large tables do not require full dataset downloads. Enterprise-only AG Grid features shall not be required for baseline acceptance.

- Base path: /api/v1

- Transport: HTTPS in non-local environments.

- Content type: application/json unless a file export endpoint is used.

- Authentication: Authorization: Bearer <JWT>.

- Dates: ISO 8601 strings; server shall normalize timezone handling consistently.

- Pagination: limit + offset or cursor for large detail lists.

- Error payload: { code, message, details?, requestId }.

## 15.2 Authentication Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /api/v1/auth/login | Authenticate and issue access token |
| POST | /api/v1/auth/refresh | Optional refresh-token flow |
| POST | /api/v1/auth/logout | Client/session termination |
| GET | /api/v1/auth/me | Return current authenticated user and |
|   |   | role/scope |

## 15.3 KPI Endpoints

| Method | Endpoint | Key query parameters | Response |
| --- | --- | --- | --- |
| GET | /api/v1/metrics/summary | startDate, endDate, portId | Executive KPI summary |
| GET | /api/v1/metrics/trs | startDate, endDate, portId, | Monthly TRS metrics |
|   |   | hsCode |   |
| GET | /api/v1/metrics/revenue | startDate, endDate, portId, | Revenue and valuation |
|   |   | hsCode | analytics |
| GET | /api/v1/metrics/enforcement | startDate, endDate, portId | Flag/seizure counts and rates |
| GET | /api/v1/metrics/org | startDate, endDate, portId | Organizational KPI scorecard |

## 15.4 Detail Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/v1/shipments/anomalies | List valuation anomaly candidates |
| GET | /api/v1/shipments/:id | Shipment detail |
| GET | /api/v1/ports | Authorized port list |
| GET | /api/v1/hs-codes | HS master search |

## 15.5 Rules and Alerts Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/v1/rules | List rules |
| POST | /api/v1/rules | Create rule |
| PATCH | /api/v1/rules/:id | Update rule |
| DELETE | /api/v1/rules/:id | Disable/delete rule |
| GET | /api/v1/alerts | List alerts |


| Method | Endpoint | Purpose |
| --- | --- | --- |
| PATCH | /api/v1/alerts/:id/acknowledge | Acknowledge alert |

## 15.6 Example TRS Response

```
GET /api/v1/metrics/trs?startDate=2025-01-01&endDate=2026-12-31&portId=3
{
"filters": {"startDate":"2025-01-01","endDate":"2026-12-31","portId":3},
"summary": {"averageHours":61.8,"medianHours":49.2,"p90Hours":118.7},
"series": [
{"month":"2026-01","averageHours":58.1,"shipmentCount":1820},
{"month":"2026-02","averageHours":63.4,"shipmentCount":1751}
]
}
```

## 15.7 HTTP Status Codes

| Code | Meaning | Typical use |
| --- | --- | --- |
| 200 | Success | GET / metrics |
| 201 | Created | POST rule/user |
| 204 | No Content | Successful update without body |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Role/scope violation |
| 404 | Not Found | Missing resource |
| 409 | Conflict | Duplicate master data |
| 422 | Unprocessable Entity | Business validation error |
| 429 | Too Many Requests | Rate limiting |
| 500 | Internal Server Error | Unexpected backend error |

## 16. Security and Access Control

## 16.1 Security Requirements

## SEC-001 | Least privilege | Must

Users shall receive only the permissions and data scope required by their role.

## SEC-002 | Password security | Must

Passwords shall be hashed using a current password hashing algorithm; passwords shall never be logged.

## SEC-003 | Token validation | Must

JWT signature and expiry shall be verified for every protected request.

## SEC-004 | Input validation | Must

API inputs shall be schema-validated and sanitized before use.

## SEC-005 | SQL injection prevention | Must

Use parameterized queries or a trusted query builder/ORM; never concatenate untrusted values into SQL.

## SEC-006 | CORS | Must

Configure an allowlist for browser origins in non-local deployments.

## SEC-007 | Secrets | Must

Database credentials and JWT signing keys shall come from environment variables or a secret manager.

## SEC-008 | HTTPS | Must

All deployed traffic shall use HTTPS.


## SEC-009 | Authorization before data access | Must

The backend shall derive permitted port scope from authenticated identity and not trust client-submitted role/scope fields.

## SEC-010 | Sensitive logging | Must

Logs shall avoid passwords, full JWTs, and unnecessary sensitive financial payloads.

## 16.2 RBAC Enforcement Model

1. Verify JWT -> 2. Load user role/scope -> 3. Evaluate route permission -> 4. Constrain SQL by authorized port IDs

- > 5. Execute aggregation -> 6. Return only authorized rows/metrics

## 17. Auditability, Logging, and Monitoring

| Event | Log required? | Example |
| --- | --- | --- |
| Successful login | Yes | user_id, timestamp, IP |
| Failed login | Yes | username/email hash or redacted |
|   |   | identifier, timestamp, IP |
| Role change | Yes | actor, subject, old role, new role |
| Port-scope change | Yes | actor, subject, added/removed ports |
| Rule creation/update | Yes | rule ID, actor, change summary |
| Alert acknowledgement | Yes | user, alert ID, timestamp |
| Master-data change | Yes | entity and changed fields |
| Export action | Yes | user, report type, filters |
| API error | Yes | requestId, endpoint, status, sanitized |
|   |   | error |

## 17.1 Operational Observability

- Structured backend logs in JSON format for deployed environments.

- Unique requestId per API call.

- Health endpoint: GET /health.

- Readiness endpoint: GET /ready that verifies required dependencies.

- Database connection pool monitoring.

- Optional metrics endpoint compatible with Prometheus or a cloud monitoring service.

## 18. Non-Functional Requirements

| Category | Requirement | Target / Standard |
| --- | --- | --- |
| Performance | Common dashboard aggregations | P95 <= 500 ms under representative |
|   |   | prototype load |
|   |   | Useful shell visible within 2 seconds on |
| Performance | Initial page render | typical broadband environment; API- |
|   |   | dependent data may load progressively |
|   |   | At least 50,000 shipments initially; |
| Scalability | Transactional volume | schema/API should support 10x growth |
|   |   | without redesign |
| Availability | Prototype uptime | Best effort; production target can be |
|   |   | defined later |
| Security | RBAC/data isolation | 0 unauthorized data accesses in |
|   |   | acceptance security tests |
| Maintainability | Code organization | Separate controller/service/repository |
|   |   | responsibilities |
| Reliability | Error handling | No unhandled promise rejection or |
|   |   | database error sent to client |
| Usability | Desktop dashboard | Readable at 1366x768 and above |
| Accessibility | UI | Keyboard-accessible interactive controls; |


| Category | Requirement | Target / Standard |
| --- | --- | --- |
|   |   | meaningful labels and color-independent |
|   |   | status indicators |
| Data integrity | Referential integrity | Enforced foreign keys for core entities |
| Observability | Diagnostics | Request IDs, structured logs, health |
|   |   | checks |

## 18.1 Availability and Recovery

- Database backups should be enabled for any shared/staging environment.

- Deployment must support rollback to the previous known-good build.

- Schema migrations must be versioned and tested before deployment.

- Seed/reference data must be repeatable from version-controlled scripts.

## 19. Error Handling and Resilience

## 19.1 Error Categories

| Category | Example | System behavior |
| --- | --- | --- |
| Validation | Invalid date range | HTTP 400/422 with field-level message |
| Authorization | Port Manager requests another port | HTTP 403; log security event |
| Authentication | Expired JWT | HTTP 401; frontend redirects to |
|   |   | login/refresh |
| Data quality | release_time earlier than arrival_time | Exclude from KPI and log anomaly |
| Database | Transient connection failure | Return HTTP 503; retry only for safe |
|   |   | idempotent operations |
| Unexpected | Unhandled server exception | HTTP 500 with requestId; detailed error |
|   |   | only in server logs |

## 19.2 Data Quality Rules

- Shipment IDs must be unique.

- Port and HS code foreign keys must exist.

- Declared value and tax collected must be non-negative in synthetic baseline data.

- Released shipments must have release_time populated.

- Unreleased shipments may have release_time = NULL and must be excluded from release-time calculations.

- Inspection status must belong to the allowed status vocabulary unless a master-status table is introduced.

## 20. Reporting and Export Requirements

| Report | Contents | Format | Access |
| --- | --- | --- | --- |
| National KPI Snapshot | Selected-period summary | CSV; PDF optional | National roles / authorized |
|   | metrics |   | executive users |
| TRS Performance Report | Port/month release metrics | CSV | Authorized analytics users |
|   | and target variance |   |   |
| Revenue Anomaly Report | Shipment-level valuation | CSV | Revenue/audit/admin per |
|   | anomalies |   | scope |
| Enforcement Report | Flagged/seized/cleared counts | CSV | Enforcement/national roles |
|   | and rates |   | per scope |
| Alerts Report | Alert history and | CSV | Authorized users |
|   | acknowledgement state |   |   |
|   |   |   | System Administrator / |
| Audit Log Report | Security/admin events | CSV | National Auditor as |
|   |   |   | configured |


## 20.1 Export Controls

- Exports must use the same authorization filters as interactive screens.

- Export metadata should include report name, generated timestamp, user, selected period, and scope.

- Large exports should be streamed or queued rather than building excessively large in-memory arrays.

## 21. Data Generation and Simulation Requirements

## 21.1 Dataset Target

| Dataset | Target volume | Notes |
| --- | --- | --- |
| Ports | 5-20 | Mix of seaports, airports, land borders |
| HS codes | 100-500 | Synthetic reference values and rates |
| Shipments | 50,000 | Distributed over 24 months |
| Users | 20-100 | Multiple roles and port assignments |
| Rules | 10-50 | Mix of national and port-specific |
|   |   | thresholds |

## 21.2 Data Distribution Rules

- Use repeatable random seeds so test environments can reproduce the same dataset.

- Spread shipment volume across months and ports with modest seasonality.

- Generate realistic but non-identifying declaration values.

- Generate realistic release durations with most records inside target and a smaller tail of slow releases.

- Generate inspection statuses with controlled proportions for Cleared, Flagged, and Seized.

## 21.3 Deliberate Anomaly Injection

## 21.4 Enhanced Simulation Controls

- All timestamps shall be stored and generated in UTC. 
Real-time
 prototype behavior means filter-triggered refresh plus optional polling; the prototype default dashboard polling interval is 60 seconds.

- The generator shall create at least 50,000 shipments across at least 6 simulated ports and 24 months of activity.

- The generator shall inject approximately 3-5% valuation anomalies with declared value materially below the HS historical benchmark; at least one deterministic fixture shall be 50% below the benchmark for acceptance testing.

- Port-specific release-time distributions shall create at least one intentionally slow/bottleneck port with average release time above the configured target in selected months.

- The generator shall seed organizational indicators per port/month where enabled: officers on duty, training hours, system uptime percentage, and backlog count.

- A fixed random seed shall be supported so the same test dataset can be regenerated deterministically.

- At least 20 seeded valuation anomalies where declared_value is 50% or more below historical_avg_value.

- At least 20 long-release shipments above 72 hours.

- At least 10 records with inspection_status = Seized.

- At least 5 invalid timestamp records reserved for data-quality tests and excluded from KPI calculations.

## 21.4 Example Generation Pseudocode

```
for shipment in range(50000):
port = weighted_choice(ports)
hs = weighted_choice(hs_codes)
ref = hs.historical_avg_value
declared = random_value_around(ref)
if shipment_id in seeded_anomaly_ids:
```


```
declared = ref * 0.50
arrival = random_datetime(month_window)
release = arrival + random_duration()
```

```
status = weighted_choice([Cleared, Flagged, Seized])
tax = declared * hs.standard_tax_rate / 100
insert(shipment)
```

## 22. Testing and Quality Assurance

## 22.1 Test Levels

| Level | Coverage | Tools / Approach |
| --- | --- | --- |
| Unit tests | Formula functions, validators, utilities | Jest/Vitest/Python pytest |
| API tests | Routes, auth, RBAC, error responses | Jest/Supertest/Postman/Newman |
| Integration tests | API + MySQL queries | Test MySQL database / Docker |
| UI tests | Filters, navigation, rendering | React Testing Library / Playwright |
| Security tests | Token and scope isolation | Automated API authorization matrix |
| Performance tests | Aggregation latency and concurrency | k6/Artillery/JMeter |
| UAT | Business workflows and KPI | Checklist with expected results |
|   | interpretation |   |

## 22.2 Critical Acceptance Test Cases

| TC ID | Scenario | Expected result |
| --- | --- | --- |
| TC-001 | Valid user login | JWT issued; dashboard accessible |
|   |   | according to role |
| TC-002 | Invalid password | 401; no token issued |
| TC-003 | Expired token | 401; protected request rejected |
| TC-004 | Port Manager requests unauthorized | 403; no records returned |
|   | port |   |
| TC-005 | TRS calculation on known timestamps | Exact expected hours returned |
| TC-006 |   | Shipment with 50% under-declared value Anomaly flagged when threshold <= 50% |
| TC-007 | 72-hour threshold breached | Alert created at correct severity |
| TC-008 | Duplicate rule evaluation | No duplicate alert within configured |
|   |   | deduplication window |
| TC-009 | Invalid release timestamp | Record excluded from TRS and logged for |
|   |   | data quality |
| TC-010 | CSV export by port-scoped user | Export contains only authorized port |
|   |   | data |

## 22.3 Definition of Done

- All Must requirements in this SRS are implemented or explicitly waived.

- Critical test cases pass.

- No known critical/high security defects remain.

- Dashboard calculations reconcile to direct SQL verification queries.

- Seeded anomalies are discoverable from the UI.

- README and environment setup are documented.

- Application can be started from a clean environment using documented steps.

## 23. Deployment and DevOps

## 23.1 Environments

| Environment | Purpose |
| --- | --- |
| Local | Developer workstation; local MySQL / Docker MySQL |
| Development | Shared integration and feature testing |


| Environment | Purpose |
| --- | --- |
| Staging | Release candidate / UAT |
| Production / Demo | Portfolio or controlled demonstration deployment |

## 23.2 Environment Variables

NODE_ENV=development PORT=5000 DATABASE_URL=mysql://user:password@host:3306/pmm_dashboard JWT_SECRET=replace_with_secret JWT_EXPIRES_IN=1h CORS_ORIGIN=http://localhost:5173

## 23.3 Containerization

Docker is optional for the first local prototype but recommended to make the Node.js API and MySQL service reproducible. A docker-compose configuration may provide backend, database, and optional frontend services. Database volumes must be persisted outside the container lifecycle for non-ephemeral environments.

## 23.4 CI/CD Pipeline

- On pull request: install dependencies, lint, unit tests, API tests, and build.

- On main branch merge: build deployable artifacts and run integration tests.

- Staging deployment: run migrations and smoke tests.

- Production/demo deployment: require successful staging checks and an explicit release step.

## 24. 14-Day Implementation Plan

| Day | Phase | Deliverables | Exit criteria |
| --- | --- | --- | --- |
|   |   | GitHub repo, |   |
|   |   | React+TypeScript+Vite |   |
|   |   | frontend skeleton, |   |
| 1 | Architecture & Data | TypeScript backend | Repo builds; DB schema |
|   |   | skeleton, MySQL schema, | applied |
|   |   | AG Grid baseline, base |   |
|   |   | config |   |
|   |   | 50k shipment generator, | Seed dataset generated |
| 2 | Data Engineering | reference data, anomaly seed | reproducibly |
|   |   | logic |   |
|   |   | Express + TypeScript app, |   |
|   |   | DB pool, typed |   |
|   |   | middleware, | Server starts; DB connection |
| 3 | Backend Foundation | controllers/services/repo | verified |
|   |   | sitories, scheduled-job |   |
|   |   | scaffold |   |
|   |   | Login, JWT, roles, user- |   |
|   |   | port scope, typed auth | Protected endpoints reject |
| 4 | Auth & RBAC | context, server-side | unauthorized scope |
|   |   | authorization tests |   |
| 5 | TRS API | /metrics/trs queries and | Known timestamp tests pass |
|   |   | formulas |   |
| 6 | Revenue API | /metrics/revenue, anomaly | Seeded anomalies appear |
|   |   | query | correctly |
| 7 | Enforcement API | Status aggregations and rates | Counts reconcile with raw |


| Day | Phase | Deliverables | Exit criteria |
| --- | --- | --- | --- |
|   |   |   | data |
|   | QA Backend | Error handling, | API test suite green |
| 8 |   | Postman/Newman collection, |   |
|   |   | query optimization |   |
|   |   | React + TypeScript + Vite |   |
|   |   | layout, Tailwind/MUI, |   |
|   |   | Redux Toolkit/global | All pages route and render |
| 9 | Frontend Foundation | filters, AG Grid | shell |
|   |   | integration, |   |
|   |   | sidebar/header/routing |   |
|   |   | Summary cards, typed |   |
|   |   | API service layer, filter |   |
| 10 | Dashboard KPIs | context, executive | KPIs match API responses |
|   |   | scorecard |   |
|   |   | TRS line/distribution |   |
|   |   | charts, revenue anomaly |   |
| 11 | Charts | visuals, enforcement | Charts render with |
|   |   | visuals, bottleneck | loading/empty states |
|   |   | ranking |   |
|   |   | Date/port/HS/status |   |
|   |   | filters, AG Grid server- |   |
| 12 | Global Filters | backed | Filter changes refresh |
|   |   | sorting/filtering/paginati | supported modules |
|   |   | on, drill-down behavior |   |
|   |   | Skeleton loading, AG Grid |   |
|   |   | anomaly table, alerts UI, |   |
| 13 | Polish & QA | auto-resolution display, | Critical UI defects resolved |
|   |   | accessibility/type/lint |   |
|   |   | pass |   |
|   | Documentation & Demo | README, architecture notes, | Release candidate |
| 14 |   | deployment notes, demo | documented and |
|   |   | video | demonstrable |

## 24.1 Recommended Git Branching

├── develop

├── feature/auth-rbac

├── feature/trs-metrics

├── feature/revenue-analytics

├── feature/enforcement

├── feature/dashboard-ui

└── feature/rules-alerts

## main

## 25. Acceptance Criteria

## Additional v2.0 acceptance criteria

- AG Grid anomaly and shipment tables must paginate/sort/filter using backend query parameters without downloading the full 50,000-row dataset into the browser.

- Frontend and backend build pipelines must complete with zero TypeScript compiler errors.


- TRS distribution buckets (<6h, 6-24h, 24-72h, >72h) must reconcile to the filtered valid release population.

- The seeded bottleneck port must rank above configured target in at least one test period and generate a corresponding threshold alert within the scheduler window.

- Rule auto-resolution must preserve the original alert record and transition status only after the KPI returns to compliance.

- Organizational monthly indicators must be visible by authorized port and must respect RBAC scope.

- At least one deterministic 50% valuation anomaly and the injected anomaly population must appear in the AG Grid anomaly view at the configured threshold.

- National Auditors must be able to manage rules in the prototype only through authorized UI/API paths; every create/update/enable/disable action must produce an audit log.

- 1. The application can be started from a documented clean setup and the database schema can be initialized from version-controlled SQL.

- 2. The system contains at least 50,000 reproducible simulated shipments spanning 24 months.

- 3. The frontend authenticates users through the backend and enforces role and port scope.

- 4. The four PMM-aligned dashboard dimensions are accessible through role-aware navigation.

- 5. TRS average release time and trend metrics reconcile to independently calculated SQL results.

- 6. Revenue analytics correctly compute analytical theoretical revenue, gap, and configurable valuation anomalies.

- 7. Enforcement counts and normalized rates reconcile to source records.

- 8. Threshold rules create visible alerts with correct severity and without unauthorized cross-scope exposure.

- 9. Port-scoped users cannot view or export data from ports they are not assigned to.

- 10. National users can compare authorized entry points.

- 11. The main dashboard remains responsive and usable at 1366x768.

- 12. Critical security, data-integrity, and calculation test cases pass.

- 13. Documentation includes architecture, setup, environment variables, API overview, and known limitations.

## 26. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Misinterpretation of analytical valuation |   | Label as analytical reference/estimate; |
| as legal valuation | High | document limitations; do not present as |
|   |   | an official duty assessment. |
|   |   | Composite indexes, EXPLAIN plans, pre- |
| Slow aggregation queries | High | aggregation/caching if needed, |
|   |   | pagination. |
|   |   | Server-side scope enforcement, |
| RBAC data leakage | Critical | authorization integration tests, never |
|   |   | trust client scope identifiers. |
| Poor synthetic data realism | Medium | Seed distributions, domain review, |
|   |   | repeatable scenarios, anomaly fixtures. |
|   |   | Store timestamps consistently, document |
| Timezone inconsistency | Medium | timezone policy, convert at API/UI |
|   |   | boundaries. |
|   |   | Deduplication, severity rules, |
| Threshold noise / alert fatigue | Medium | acknowledgement workflow, |
|   |   | configurable re-alert windows. |
|   |   | Version PMM/TRS alignment in the |
| Changing WCO reference material | Medium | product documentation and keep |
|   |   | mappings configurable. |
|   |   | Use this SRS as baseline; new |
| Scope expansion | High | integrations become separate change |
|   |   | requests. |


## Additional v2.0 risks

- AG Grid feature/licensing mismatch  keep the baseline dependent only on Community-available functionality and server-backed pagination; gate Enterprise-only features explicitly.

- Frontend/back-end type drift - mitigate with shared DTO types or generated schema contracts and CI type- checking.

- Over-fetching detail rows - mitigate with API-side pagination, selective columns, composite indexes, and EXPLAIN-plan validation.

## 27. Future Enhancements

- Move from synthetic records to controlled ingestion pipelines for real customs data.

- Add event-level customs process timestamps for deeper TRS bottleneck analysis.

- Add machine-learning risk scoring for valuation, misclassification, or enforcement prioritization.

- Add national tariff schedules and versioned tariff effective dates.

- Add geospatial visualization by port and trade corridor.

- Add scheduled email or in-app alert delivery.

- Add multilingual UI and accessibility localization.

- Add data warehouse/star-schema reporting for very high volumes.

- Add SSO/OIDC integration for government identity providers.

- Add immutable or externally stored audit trails for regulated deployments.

## 28. References

The following sources were consulted to validate the WCO framing used in this SRS. The project remains a simulated dashboard and does not claim official WCO implementation status.

[1] World Customs Organization - Performance Measurement Mechanism / PMM About. https://pmm.wcoomd.org/about — Four dimensions, PMM history, expected outcomes and KPIs. [2] World Customs Organization - Time Release Study Guide, Version 4. https://www.wcoomd.org/en/topics/facilitation/instrument-and-tools/tools/time-release-study.aspx — TRS methodology and 2025 Version 4 reference. [3] World Customs Organization - WCO Performance Measurement Mechanism. https://www.wcoomd.org/en/topics/capacity-building/instrument-and-tools/pmm.aspx — PMM overview, dimensions and benefits. [4] World Customs Organization - Harmonized System FAQ. https://www.wcoomd.org/en/topics/nomenclature/overview/harmonized_system_faq.aspx — HS structure and classification background. [5] World Customs Organization - PMM Library. https://pmm.wcoomd.org/library — PMM dimension/outcome/KPI reference library. [6] Project-supplied PMM Dashboard SRS PDF (14 pages, uploaded with this revision) — additional prototype features reviewed for inclusion: release-time distribution buckets, bottleneck ranking, rule scheduling, alert auto-resolution, organizational monthly indicators, deterministic data seeding, top-10 revenue-gap views, and optional z-score anomaly signal.

Additional source supplied in the project brief: “An Overview of Performance Measurement in Customs Administrations” (ResearchGate). The source can be retained as background reading, but official WCO pages are preferred for normative/current PMM framing.


## 29. Appendices

## Appendix A - Sample SQL for TRS Aggregation

```
SELECT
s.port_id,
DATE_FORMAT(s.arrival_time, '%Y-%m') AS month,
AVG(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS avg_release_hours,
COUNT(*) AS shipment_count
FROM shipments s
WHERE s.release_time IS NOT NULL
AND s.arrival_time >= ?
AND s.arrival_time < ?
AND s.arrival_time <= s.release_time
AND s.port_id IN (...)
GROUP BY s.port_id, DATE_FORMAT(s.arrival_time, '%Y-%m')
ORDER BY month, s.port_id;
```

## Appendix B - Sample SQL for Valuation Anomalies

```
SELECT
s.shipment_id, s.port_id, s.hs_code,
s.declared_value, h.historical_avg_value,
((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value,0)) * 100 AS
deviation_pct,
(h.historical_avg_value * h.standard_tax_rate / 100) AS theoretical_revenue,
GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected) AS revenue_gap
FROM shipments s
JOIN hs_codes h ON h.hs_code = s.hs_code
WHERE ((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value,0)) * 100 >= ?
AND s.arrival_time >= ?
AND s.arrival_time < ?;
```

## Appendix C - Example API Error

```
{
"code": "PORT_SCOPE_VIOLATION",
"message": "The authenticated user is not authorized to access the requested port.",
"requestId": "REQ-20261005-AB12CD"
}
```

## Appendix D - Minimum Definition of a Production-Hardened Version

- Approved PMM version and KPI mapping documented against official WCO material.

- Production-grade SSO/MFA, secret management, centralized logging, backup, monitoring, and disaster recovery.

- Formal data governance and data retention policy.

- Validated national tariff/valuation business rules reviewed by customs domain experts.

- Load testing at expected concurrent-user and transaction volumes.

- Formal penetration testing and security sign-off.

- Operational runbook, incident response process, and change-management process.

## End of SRS

This document is the baseline requirements specification for the Customs PMM Dashboard prototype. Any requirement that changes product scope, data semantics, architecture, or security behavior should be logged as a controlled change request and reflected in the next SRS revision.

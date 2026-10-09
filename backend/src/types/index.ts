// Shared TypeScript types for the Customs PMM Dashboard
// Used by both frontend and backend API contracts

// ── Enums ──────────────────────────────────────────────

export type RoleName =
  | 'National Auditor'
  | 'National Customs Analyst'
  | 'Port Manager'
  | 'Revenue Officer'
  | 'Enforcement Officer'
  | 'System Administrator'
  | 'Executive Viewer';

export type InspectionStatus = 'Cleared' | 'Flagged' | 'Seized';

export type AlertSeverity = 'Info' | 'Warning' | 'Critical';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';

export type KpiState = 'Normal' | 'Warning' | 'Critical';

export type LocationType = 'Seaport' | 'Airport' | 'Land Border';

export type ScopeType = 'NATIONAL' | 'PORT';

export type RuleOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

// ── Entity Interfaces ──────────────────────────────────

export interface Port {
  port_id: number;
  port_name: string;
  location_type: LocationType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HsCode {
  hs_code: string;
  description: string;
  standard_tax_rate: number;
  historical_avg_value: number;
  currency_code: string;
  is_active: boolean;
}

export interface Shipment {
  shipment_id: string;
  port_id: number;
  hs_code: string;
  declared_value: number;
  tax_collected: number;
  arrival_time: string;
  release_time: string | null;
  inspection_status: InspectionStatus;
  created_at: string;
}

export interface User {
  user_id: number;
  email: string;
  role_id: number;
  role_name: RoleName;
  status: string;
  ports: number[];
}

export interface Role {
  role_id: number;
  role_name: RoleName;
}

export interface KpiRule {
  rule_id: string;
  metric_code: string;
  operator: RuleOperator;
  threshold_value: number;
  scope_type: ScopeType;
  scope_id: number | null;
  severity: AlertSeverity;
  active_from: string | null;
  active_to: string | null;
  enabled: boolean;
}

export interface Alert {
  alert_id: string;
  rule_id: string;
  metric_code: string;
  observed_value: number;
  threshold_value: number;
  scope_id: number | null;
  severity: AlertSeverity;
  status: AlertStatus;
  created_at: string;
  acknowledged_at: string | null;
}

export interface AuditLog {
  audit_id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata_json: any;
  ip_address: string | null;
  created_at: string;
}

export interface KpiTarget {
  target_id: number;
  metric_code: string;
  target_value: number;
  unit: string;
  period_type: string;
  scope_type: ScopeType;
  scope_id: number | null;
}

export interface OrgMetric {
  port_id: number;
  metric_month: string;
  officers_on_duty: number;
  training_hours: number;
  system_uptime_pct: number;
  backlog_count: number;
}

// ── API Response DTOs ──────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  requestId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  portId?: number;
  hsCode?: string;
  inspectionStatus?: InspectionStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}

// ── KPI Summary DTO ────────────────────────────────────

export interface KpiSummaryResponse {
  filters: {
    startDate: string;
    endDate: string;
    portId: number | null;
  };
  totalRevenue: number;
  averageClearanceHours: number;
  shipmentVolume: number;
  anomalyCount: number;
  flaggedCount: number;
  seizureCount: number;
  analyticalRevenueGap: number;
  openAlertCount: number;
}

// ── TRS DTO ────────────────────────────────────────────

export interface TrsSummary {
  averageHours: number;
  medianHours: number;
  p90Hours: number;
  minHours: number;
  maxHours: number;
  targetCompliancePct: number;
}

export interface TrsMonthly {
  month: string;
  averageHours: number;
  medianHours: number;
  shipmentCount: number;
}

export interface TrsDistributionBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface TrsResponse {
  filters: {
    startDate: string;
    endDate: string;
    portId: number | null;
  };
  summary: TrsSummary;
  series: TrsMonthly[];
  distribution: TrsDistributionBucket[];
}

// ── Revenue DTO ────────────────────────────────────────

export interface RevenueSummary {
  totalActualRevenue: number;
  totalTheoreticalRevenue: number;
  analyticalRevenueGap: number;
  revenueGapPct: number;
  anomalyCount: number;
}

export interface RevenueResponse {
  filters: {
    startDate: string;
    endDate: string;
    portId: number | null;
  };
  summary: RevenueSummary;
}

export interface ValuationAnomaly {
  shipment_id: string;
  port_id: number;
  port_name: string;
  hs_code: string;
  hs_description: string;
  declared_value: number;
  reference_value: number;
  deviation_pct: number;
  tax_collected: number;
  theoretical_revenue: number;
  revenue_gap: number;
  arrival_time: string;
}

// ── Enforcement DTO ────────────────────────────────────

export interface EnforcementSummary {
  totalShipments: number;
  clearedCount: number;
  flaggedCount: number;
  seizedCount: number;
  flagRate: number;
  seizureRate: number;
}

export interface EnforcementMonthly {
  month: string;
  clearedCount: number;
  flaggedCount: number;
  seizedCount: number;
  flagRate: number;
  seizureRate: number;
}

export interface EnforcementResponse {
  filters: {
    startDate: string;
    endDate: string;
    portId: number | null;
  };
  summary: EnforcementSummary;
  series: EnforcementMonthly[];
}

// ── Org Scorecard DTO ──────────────────────────────────

export interface OrgScorecardResponse {
  filters: {
    startDate: string;
    endDate: string;
    portId: number | null;
  };
  metrics: OrgMetric[];
}

export interface KpiSummary {
  totalRevenue: number;
  averageClearanceHours: number;
  shipmentVolume: number;
  anomalyCount: number;
  flaggedCount: number;
  seizureCount: number;
  analyticalRevenueGap: number;
  openAlertCount: number;
}

export interface TrsSeries {
  month: string;
  averageHours: number;
  shipmentCount: number;
}

export interface EnfSeries {
  month: string;
  flaggedCount: number;
  seizedCount: number;
  clearedCount: number;
}

export interface TrsData {
  summary: {
    averageHours: number;
    medianHours: number;
    p90Hours: number;
    minHours: number;
    maxHours: number;
    targetCompliancePct: number;
  };
  series: TrsSeries[];
  distribution: {
    label: string;
    count: number;
    percentage: number;
  }[];
  bottleneckRanking: {
    portId: number;
    portName: string;
    averageHours: number;
    shipmentCount: number;
    exceedsTarget: boolean;
  }[];
}

export interface RevenueSummary {
  totalActualRevenue: number;
  totalTheoreticalRevenue: number;
  analyticalRevenueGap: number;
  revenueGapPct: number;
  anomalyCount: number;
}

export interface RevenueSeries {
  month: string;
  actualRevenue: number;
  theoreticalRevenue: number;
  revenueGap: number;
  shipmentCount: number;
}

export interface TopHsCode {
  hsCode: string;
  description: string;
  totalGap: number;
  shipmentCount: number;
}

export interface TopPort {
  portId: number;
  portName: string;
  totalGap: number;
  shipmentCount: number;
}

export interface RevenueData {
  summary: RevenueSummary;
  series: RevenueSeries[];
  topHsCodes: TopHsCode[];
  topPorts: TopPort[];
}

export interface EnforcementData {
  summary: {
    totalShipments: number;
    clearedCount: number;
    flaggedCount: number;
    seizureCount: number;
    flagRate: number;
    seizureRate: number;
    hitRate: number;
  };
  series: {
    month: string;
    clearedCount: number;
    flaggedCount: number;
    seizedCount: number;
    flagRate: number;
    seizureRate: number;
  }[];
  portComparison: {
    portId: number;
    portName: string;
    totalShipments: number;
    flaggedCount: number;
    seizedCount: number;
    flagRate: number;
    seizureRate: number;
  }[];
}

export interface OrgMetric {
  port_id: number;
  port_name: string;
  metric_month: string;
  officers_on_duty: number;
  training_hours: number;
  system_uptime_pct: number;
  backlog_count: number;
}

export interface OrgData {
  metrics: OrgMetric[];
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  portId?: number | null;
  hsCode?: string | null;
  sortBy?: string;
  sortDir?: string;
  inspectionStatus?: string | null;
}

export interface Alert {
  alert_id: string | number;
  rule_id: string;
  metric_code?: string;
  rule_metric?: string;
  severity: string;
  observed_value?: number;
  threshold_value?: number;
  message?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'AUTO_RESOLVED';
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRows: number;
  page: number;
  pageSize: number;
}

export interface AnomalyRecord {
  shipment_id: string;
  port_name: string;
  hs_code: string;
  hs_description: string;
  declared_value: number;
  reference_value: number;
  deviation_pct: number;
  revenue_gap: number;
  arrival_time: string;
}

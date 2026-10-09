import api from './api';
import {
  KpiSummary,
  TrsData,
  RevenueData,
  EnforcementData,
  OrgData,
  FilterParams,
  PaginatedResponse,
  AnomalyRecord,
} from '../types/api';

const buildQueryString = (filters: FilterParams, extraParams?: Record<string, string | number>) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.portId) params.append('portId', filters.portId.toString());
  if (filters.hsCode) params.append('hsCode', filters.hsCode);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortDir) params.append('sortDir', filters.sortDir);
  
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
  }
  return params.toString();
};

export const metricsService = {
  getSummary: async (filters: FilterParams): Promise<KpiSummary> => {
    const res = await api.get(`/metrics/summary?${buildQueryString(filters)}`);
    return res.data;
  },

  getTrsMetrics: async (filters: FilterParams): Promise<TrsData> => {
    const res = await api.get(`/metrics/trs?${buildQueryString(filters)}`);
    return res.data;
  },

  getRevenueMetrics: async (filters: FilterParams): Promise<RevenueData> => {
    const res = await api.get(`/metrics/revenue?${buildQueryString(filters)}`);
    return res.data;
  },

  getEnforcementMetrics: async (filters: FilterParams): Promise<EnforcementData> => {
    const res = await api.get(`/metrics/enforcement?${buildQueryString(filters)}`);
    return res.data;
  },

  getOrgMetrics: async (filters: FilterParams): Promise<OrgData> => {
    const res = await api.get(`/metrics/org?${buildQueryString(filters)}`);
    return res.data;
  },

  getAnomalies: async (
    filters: FilterParams, 
    page: number = 1, 
    pageSize: number = 50
  ): Promise<PaginatedResponse<AnomalyRecord>> => {
    const res = await api.get(`/shipments/anomalies?${buildQueryString(filters, { page, pageSize })}`);
    return res.data;
  },

  getAlerts: async (page: number = 1, pageSize: number = 100) => {
    const res = await api.get(`/alerts?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },

  acknowledgeAlert: async (id: number) => {
    await api.patch(`/alerts/${id}/acknowledge`);
  }
};

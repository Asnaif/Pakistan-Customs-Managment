import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPortId, setHsCode } from '../store/slices/filterSlice';
import { metricsService } from '../services/metricsService';
import { RevenueSummary, RevenueSeries, TopHsCode, TopPort } from '../types/api';
import EmptyState from '../components/layout/EmptyState';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

const RevenueIntelligence = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [series, setSeries] = useState<RevenueSeries[]>([]);
  const [topHsCodes, setTopHsCodes] = useState<TopHsCode[]>([]);
  const [topPorts, setTopPorts] = useState<TopPort[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await metricsService.getRevenueMetrics(filters);
        setSummary(data.summary);
        setSeries(data.series || []);
        setTopHsCodes(data.topHsCodes || []);
        setTopPorts(data.topPorts || []);
      } catch (err) {
        console.error('Failed to load revenue metrics', err);
      }
    };
    fetchSummary();
  }, [filters]);

  const gridRef = useRef<AgGridReact>(null);

  // Update grid datasource when filters change
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [filters]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    const dataSource: IDatasource = {
      getRows: async (rowParams: IGetRowsParams) => {
        try {
          const pageSize = rowParams.endRow - rowParams.startRow;
          const page = Math.floor(rowParams.startRow / pageSize) + 1;
          
          let sortBy, sortDir;
          if (rowParams.sortModel && rowParams.sortModel.length > 0) {
            sortBy = rowParams.sortModel[0].colId;
            sortDir = rowParams.sortModel[0].sort;
          }
          
          const activeFilters: any = { ...filters };
          if (sortBy) activeFilters.sortBy = sortBy;
          if (sortDir) activeFilters.sortDir = sortDir;
          
          const res = await metricsService.getAnomalies(activeFilters, page, pageSize);
          
          let lastRow = -1;
          if (res.data.length < pageSize) {
            lastRow = rowParams.startRow + res.data.length;
          } else if (res.totalRows) {
            lastRow = res.totalRows;
          }
          
          rowParams.successCallback(res.data, lastRow);
        } catch (error) {
          console.error("Failed fetching anomalies", error);
          rowParams.failCallback();
        }
      }
    };
    params.api.setGridOption('datasource', dataSource);
  }, [filters]);

  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'shipment_id', headerName: 'Shipment ID', width: 150 },
    { field: 'port_name', headerName: 'Port', width: 130 },
    { field: 'hs_code', headerName: 'HS Code', width: 110 },
    { field: 'hs_description', headerName: 'Description', flex: 1 },
    { field: 'declared_value', headerName: 'Declared Value', width: 140, valueFormatter: p => `$${p.value}` },
    { field: 'reference_value', headerName: 'Ref Value', width: 140, valueFormatter: p => `$${p.value}` },
    { field: 'deviation_pct', headerName: 'Deviation %', width: 120, 
      cellStyle: params => params.value >= 50 ? { color: 'red', fontWeight: 'bold' } : { color: 'orange', fontWeight: 'normal' } 
    },
    { field: 'revenue_gap', headerName: 'Rev Gap', width: 130, valueFormatter: p => `$${p.value}` },
    { field: 'arrival_time', headerName: 'Arrival Date', width: 150, valueFormatter: p => new Date(p.value).toLocaleDateString() },
  ], []);

  return (
    <div className="space-y-7 pb-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>💰</span>
            <span>Revenue Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fiscal risk profiling, theoretical duty reconciliation, and valuation anomaly detection.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/80 shadow-2xs">
          <span>🔍 Automated Discrepancy Engine</span>
        </div>
      </div>
      
      {/* Modern KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
          <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual Collected</span>
              <span className="text-base">💵</span>
            </div>
            <div className="text-2xl font-black text-slate-800">${(summary.totalActualRevenue / 1000000).toFixed(2)}M</div>
            <span className="text-[11px] text-slate-400 font-medium">Duty & Tax Receipts</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Theoretical Revenue</span>
              <span className="text-base">📐</span>
            </div>
            <div className="text-2xl font-black text-indigo-600">${(summary.totalTheoreticalRevenue / 1000000).toFixed(2)}M</div>
            <span className="text-[11px] text-slate-400 font-medium">Benchmark Value Model</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Analytical Rev Gap</span>
              <span className="text-base">📉</span>
            </div>
            <div className="text-2xl font-black text-rose-600">${(summary.analyticalRevenueGap / 1000).toFixed(1)}K</div>
            <span className="text-[11px] text-rose-500 font-medium">Duty Leakage Risk</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gap Percentage</span>
              <span className="text-base">📊</span>
            </div>
            <div className="text-2xl font-black text-amber-600">{summary.revenueGapPct}%</div>
            <span className="text-[11px] text-slate-400 font-medium">Relative Variance</span>
          </div>

          <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valuation Anomalies</span>
              <span className="text-base">🔍</span>
            </div>
            <div className="text-2xl font-black text-purple-600">{summary.anomalyCount}</div>
            <span className="text-[11px] text-purple-600 font-medium">Below Ref Threshold</span>
          </div>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow h-80 shrink-0">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Revenue Trend</h3>
        {series.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${(Number(value || 0) / 1000).toFixed(1)}K`} />
              <Legend />
              <Line type="monotone" dataKey="actualRevenue" stroke="#3b82f6" name="Actual Revenue" dot={false} />
              <Line type="monotone" dataKey="theoreticalRevenue" stroke="#6366f1" name="Theoretical Revenue" dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 10 Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        {/* Top 10 HS Codes */}
        <div className="bg-white p-6 rounded-lg shadow h-80">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Top 10 HS Codes by Revenue Gap</h3>
          {topHsCodes.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={topHsCodes} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="hsCode" type="category" fontSize={11} width={70} />
                <Tooltip formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`} />
                <Bar 
                  dataKey="totalGap" 
                  fill="#f59e0b" 
                  name="Revenue Gap" 
                  radius={[0, 4, 4, 0]} 
                  onClick={(data: any) => {
                    if (data && data.hsCode) dispatch(setHsCode(data.hsCode));
                  }}
                  className="cursor-pointer hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 10 Ports */}
        <div className="bg-white p-6 rounded-lg shadow h-80">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Top 10 Ports by Revenue Gap</h3>
          {topPorts.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={topPorts} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="portName" type="category" fontSize={11} width={70} />
                <Tooltip formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`} />
                <Bar 
                  dataKey="totalGap" 
                  fill="#ef4444" 
                  name="Revenue Gap" 
                  radius={[0, 4, 4, 0]} 
                  onClick={(data: any) => {
                    if (data && data.portId) dispatch(setPortId(data.portId));
                  }}
                  className="cursor-pointer hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Anomaly AG Grid */}
      <div className="flex-1 min-h-[400px] bg-white rounded-lg shadow p-4 flex flex-col">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Valuation Anomalies ({'>='} 30% Deviation)</h3>
        <div className="ag-theme-alpine w-full flex-1">
          <AgGridReact
            ref={gridRef}
            columnDefs={colDefs}
            rowModelType="infinite"
            cacheBlockSize={20}
            pagination={true}
            paginationPageSize={20}
            domLayout="normal"
            onGridReady={onGridReady}
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueIntelligence;

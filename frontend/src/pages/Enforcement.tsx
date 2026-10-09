import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPortId } from '../store/slices/filterSlice';
import { metricsService } from '../services/metricsService';
import { EnforcementData } from '../types/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const Enforcement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const [data, setData] = useState<EnforcementData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await metricsService.getEnforcementMetrics(filters);
        setData(data);
      } catch (err) {
        console.error('Failed to load enforcement metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && !data) return <div className="p-8 text-center text-gray-500">Loading Enforcement data...</div>;
  if (!data) return null;

  return (
    <div className="space-y-7 pb-6 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>🛡️</span>
            <span>Enforcement & Security</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Risk targeting efficacy, contraband interdictions, physical inspection hit rates, and port compliance.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200/80 shadow-2xs">
          <span>🚨 Active Threat Monitoring</span>
        </div>
      </div>
      
      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Shipments</span>
            <span className="text-base">📦</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{data.summary.totalShipments.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 font-medium">Screened Volume</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cleared Without Hold</span>
            <span className="text-base">🟢</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{data.summary.clearedCount.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Green Channel Release</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inspection Flag Rate</span>
            <span className="text-base">🚩</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{data.summary.flagRate}%</div>
          <span className="text-[11px] text-slate-400 font-medium">Selected For Examination</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seizure Rate</span>
            <span className="text-base">🚨</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{data.summary.seizureRate}%</div>
          <span className="text-[11px] text-rose-500 font-medium">Confiscated Shipments</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Targeting Hit Rate</span>
            <span className="text-base">🎯</span>
          </div>
          <div className="text-2xl font-black text-indigo-600">{data.summary.hitRate}%</div>
          <span className="text-[11px] text-indigo-500 font-medium">Seizures Per Flag</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend - Stacked Bar */}
        <div className="bg-white p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Enforcement Trend</h3>
          {loading ? <LoadingSpinner /> : data.series.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clearedCount" stackId="a" fill="#10b981" name="Cleared" />
                <Bar dataKey="flaggedCount" stackId="a" fill="#f59e0b" name="Flagged" />
                <Bar dataKey="seizedCount" stackId="a" fill="#ef4444" name="Seized" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Rate Trend - Line */}
        <div className="bg-white p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Flag & Seizure Rate Trend</h3>
          {loading ? <LoadingSpinner /> : data.series.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={data.series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="flagRate" stroke="#f59e0b" activeDot={{ r: 6 }} name="Flag Rate %" />
                <Line type="monotone" dataKey="seizureRate" stroke="#ef4444" activeDot={{ r: 6 }} name="Seizure Rate %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Port Comparison */}
      <div className="bg-white p-6 rounded-lg shadow h-96">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Port Enforcement Comparison (Normalized)</h3>
        {loading ? <LoadingSpinner /> : data.portComparison.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.portComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="portName" fontSize={11} />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="flagRate" 
                fill="#f59e0b" 
                name="Flag Rate %" 
                onClick={(d: any) => { if (d && d.portId) dispatch(setPortId(d.portId)); }}
                className="cursor-pointer hover:opacity-80"
              />
              <Bar 
                dataKey="seizureRate" 
                fill="#ef4444" 
                name="Seizure Rate %" 
                onClick={(d: any) => { if (d && d.portId) dispatch(setPortId(d.portId)); }}
                className="cursor-pointer hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Enforcement;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPortId } from '../store/slices/filterSlice';
import { metricsService } from '../services/metricsService';
import { OrgMetric } from '../types/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const OrgScorecard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const [metrics, setMetrics] = useState<OrgMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await metricsService.getOrgMetrics(filters);
        setMetrics(data.metrics || []);
      } catch (err) {
        console.error('Failed to load org metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && metrics.length === 0) return <div className="p-8 text-center text-gray-500">Loading Org Scorecard...</div>;

  // Aggregate summary
  const avgUptime = metrics.length > 0 ? (metrics.reduce((s, m) => s + Number(m.system_uptime_pct), 0) / metrics.length).toFixed(1) : '0';
  const totalBacklog = metrics.reduce((s, m) => s + Number(m.backlog_count), 0);
  const totalTraining = metrics.reduce((s, m) => s + Number(m.training_hours), 0);
  const avgOfficers = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + Number(m.officers_on_duty), 0) / metrics.length) : 0;

  // Monthly aggregation for charts
  const monthMap = new Map<string, { officers: number; training: number; uptime: number; backlog: number; count: number }>();
  metrics.forEach(m => {
    const key = m.metric_month;
    const existing = monthMap.get(key) || { officers: 0, training: 0, uptime: 0, backlog: 0, count: 0 };
    existing.officers += Number(m.officers_on_duty);
    existing.training += Number(m.training_hours);
    existing.uptime += Number(m.system_uptime_pct);
    existing.backlog += Number(m.backlog_count);
    existing.count += 1;
    monthMap.set(key, existing);
  });
  const monthlySeries = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      avgUptime: Number((data.uptime / data.count).toFixed(1)),
      totalTraining: data.training,
      totalBacklog: data.backlog,
      avgOfficers: Math.round(data.officers / data.count),
    }));

  // Port comparison
  const portMap = new Map<string, { uptime: number; backlog: number; training: number; count: number }>();
  metrics.forEach(m => {
    const key = m.port_name;
    const existing = portMap.get(key) || { uptime: 0, backlog: 0, training: 0, count: 0 };
    existing.uptime += Number(m.system_uptime_pct);
    existing.backlog += Number(m.backlog_count);
    existing.training += Number(m.training_hours);
    existing.count += 1;
    portMap.set(key, existing);
  });
  const portComparison = Array.from(portMap.entries()).map(([portName, data]) => ({
    portName,
    avgUptime: Number((data.uptime / data.count).toFixed(1)),
    totalBacklog: data.backlog,
    totalTraining: data.training,
  }));

  return (
    <div className="space-y-7 pb-6 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>🏢</span>
            <span>Organizational Scorecard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            IT infrastructure reliability, customs officer workforce allocation, clearance backlog, and skill training.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-2xs">
          <span>⚡ High Availability Target &gt; 98%</span>
        </div>
      </div>
      
      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 shrink-0">
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Availability</span>
            <span className="text-base">🖥️</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{avgUptime}%</div>
          <span className="text-[11px] text-slate-400 font-medium">Platform Uptime Avg</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unprocessed Backlog</span>
            <span className="text-base">⏳</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{totalBacklog.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 font-medium">Pending Dwell Items</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capacity Training</span>
            <span className="text-base">🎓</span>
          </div>
          <div className="text-2xl font-black text-indigo-600">{totalTraining.toLocaleString()} hrs</div>
          <span className="text-[11px] text-slate-400 font-medium">Cumulative Staff Hours</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Station Staff</span>
            <span className="text-base">👮</span>
          </div>
          <div className="text-2xl font-black text-purple-600">{avgOfficers}</div>
          <span className="text-[11px] text-slate-400 font-medium">Avg Officers On Duty</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Uptime Trend */}
        <div className="bg-white p-6 rounded-lg shadow h-80">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly System Uptime</h3>
          {loading ? <LoadingSpinner /> : monthlySeries.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={monthlySeries} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis unit="%" domain={[90, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgUptime" stroke="#10b981" name="Avg Uptime %" activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Backlog Trend */}
        <div className="bg-white p-6 rounded-lg shadow h-80">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Backlog Count</h3>
          {loading ? <LoadingSpinner /> : monthlySeries.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={monthlySeries} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalBacklog" fill="#f59e0b" name="Backlog" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Port Comparison */}
      <div className="bg-white p-6 rounded-lg shadow h-80">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Port-wise Organizational Metrics</h3>
        {loading ? <LoadingSpinner /> : portComparison.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={portComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="portName" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgUptime" fill="#10b981" name="Avg Uptime %" />
              <Bar dataKey="totalBacklog" fill="#f59e0b" name="Backlog" />
              <Bar 
                dataKey="totalTraining" 
                fill="#6366f1" 
                name="Training Hrs" 
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

export default OrgScorecard;

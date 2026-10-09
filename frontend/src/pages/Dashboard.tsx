import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { metricsService } from '../services/metricsService';
import { KpiSummary, TrsSeries, EnfSeries } from '../types/api';
import EmptyState from '../components/layout/EmptyState';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const filters = useSelector((state: RootState) => state.filters);
  const [summary, setSummary] = useState<KpiSummary | null>(null);
  const [trsSeries, setTrsSeries] = useState<TrsSeries[]>([]);
  const [enfSeries, setEnfSeries] = useState<EnfSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.portId) params.append('portId', filters.portId.toString());

        const [summaryRes, trsRes, enfRes] = await Promise.all([
          metricsService.getSummary(filters),
          metricsService.getTrsMetrics(filters),
          metricsService.getEnforcementMetrics(filters),
        ]);

        setSummary(summaryRes);
        setTrsSeries(trsRes.series || []);
        setEnfSeries(enfRes.series || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();
    const interval = setInterval(fetchAll, 60000); // 60s polling
    return () => clearInterval(interval);
  }, [filters]);

  if (loading && !summary) return <div className="p-8 text-center text-gray-500">Loading metrics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!summary) return null;

  // Enforcement pie data
  const pieData = [
    { name: 'Cleared', value: summary.shipmentVolume - summary.flaggedCount - summary.seizureCount },
    { name: 'Flagged', value: summary.flaggedCount },
    { name: 'Seized', value: summary.seizureCount },
  ];

  return (
    <div className="space-y-7 pb-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>📊</span>
            <span>Executive Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time organizational performance metrics & multi-dimensional customs intelligence.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Analytical Feed</span>
        </div>
      </div>
      
      {/* Modern KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          emoji="💵" 
          title="Total Revenue Collected" 
          value={`$${(summary.totalRevenue / 1000000).toFixed(2)}M`} 
          subtitle="Tax & Duties Revenue"
          gradient="from-blue-600 to-indigo-600"
        />
        <KpiCard 
          emoji="⏱️" 
          title="Avg Clearance Time" 
          value={`${summary.averageClearanceHours.toFixed(1)} hrs`} 
          subtitle="Target Benchmark: 48h"
          gradient="from-indigo-600 to-violet-600"
        />
        <KpiCard 
          emoji="📉" 
          title="Analytical Rev Gap" 
          value={`$${(summary.analyticalRevenueGap / 1000).toFixed(1)}K`} 
          subtitle="Theoretical vs Actual"
          gradient="from-amber-500 to-orange-600"
        />
        <KpiCard 
          emoji="🚨" 
          title="Seizures Executed" 
          value={summary.seizureCount.toLocaleString()} 
          subtitle="Enforcement Actions"
          gradient="from-rose-500 to-red-600"
        />
        <KpiCard 
          emoji="📦" 
          title="Shipment Volume" 
          value={summary.shipmentVolume.toLocaleString()} 
          subtitle="Total Goods Processed"
          gradient="from-slate-700 to-slate-900"
        />
        <KpiCard 
          emoji="🔔" 
          title="Open Alerts" 
          value={summary.openAlertCount} 
          subtitle="Actionable Violations"
          gradient="from-yellow-500 to-amber-600"
        />
        <KpiCard 
          emoji="🔍" 
          title="Valuation Anomalies" 
          value={summary.anomalyCount.toLocaleString()} 
          subtitle="Flagged Under-Invoicing"
          gradient="from-orange-500 to-amber-700"
        />
        <KpiCard 
          emoji="🚩" 
          title="Flagged Shipments" 
          value={summary.flaggedCount.toLocaleString()} 
          subtitle="Inspection Directives"
          gradient="from-purple-600 to-pink-600"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TRS Trend */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 h-88 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 text-sm">⏱️</span>
              <span>Monthly Avg Release Time (TRS)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Hours to Clear</span>
          </div>
          {trsSeries.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={trsSeries} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis unit="h" fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="averageHours" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} name="Avg Hours" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Enforcement Trend */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 h-88 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 text-sm">🛡️</span>
              <span>Monthly Enforcement Status</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Shipment Outcomes</span>
          </div>
          {enfSeries.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={enfSeries} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="clearedCount" stackId="a" fill="#10b981" name="Cleared" radius={[0, 0, 0, 0]} />
                <Bar dataKey="flaggedCount" stackId="a" fill="#f59e0b" name="Flagged" radius={[0, 0, 0, 0]} />
                <Bar dataKey="seizedCount" stackId="a" fill="#ef4444" name="Seized" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Shipment Volume Trend */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 h-88 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 text-sm">📦</span>
              <span>Monthly Shipment Volume</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Goods Inflow</span>
          </div>
          {trsSeries.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={trsSeries} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="shipmentCount" fill="#6366f1" name="Shipments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inspection Status Pie */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 h-88 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600 text-sm">🎯</span>
              <span>Inspection Status Distribution</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Total Portfolio</span>
          </div>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={50}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(((percent ?? 0)) * 100).toFixed(1)}%`}
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  emoji: string;
  title: string;
  value: string | number;
  subtitle: string;
  gradient: string;
}

const KpiCard = ({ emoji, title, value, subtitle, gradient }: KpiCardProps) => (
  <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform duration-200 text-white`}>
        <span>{emoji}</span>
      </div>
    </div>
    <div>
      <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center space-x-1">
        <span>{subtitle}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;

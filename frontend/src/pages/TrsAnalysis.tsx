import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPortId } from '../store/slices/filterSlice';
import { metricsService } from '../services/metricsService';
import { TrsData } from '../types/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

const TrsAnalysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const [data, setData] = useState<TrsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await metricsService.getTrsMetrics(filters);
        setData(data);
      } catch (err) {
        console.error('Failed to load TRS metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && !data) return <div className="p-8 text-center text-gray-500">Loading TRS data...</div>;
  if (!data) return null;

  return (
    <div className="space-y-7 pb-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>⏱️</span>
            <span>Trade Facilitation (TRS Analysis)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Time Release Study metrics measuring border dwell times, process velocity, and port bottleneck ranking.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200/80 shadow-2xs">
          <span>⚡ WCO Compliant TRS Model</span>
        </div>
      </div>
      
      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Time</span>
            <span className="text-base">⏱️</span>
          </div>
          <div className="text-xl font-black text-slate-800">{data.summary.averageHours} hrs</div>
          <span className="text-[11px] text-slate-400 font-medium">Mean Duration</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Median</span>
            <span className="text-base">🎯</span>
          </div>
          <div className="text-xl font-black text-slate-800">{data.summary.medianHours} hrs</div>
          <span className="text-[11px] text-slate-400 font-medium">50th Percentile</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">P90 Bottleneck</span>
            <span className="text-base">⚠️</span>
          </div>
          <div className="text-xl font-black text-amber-600">{data.summary.p90Hours} hrs</div>
          <span className="text-[11px] text-slate-400 font-medium">Worst 10% Shipments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Min / Max</span>
            <span className="text-base">📊</span>
          </div>
          <div className="text-xl font-black text-slate-800">{data.summary.minHours} / {data.summary.maxHours}</div>
          <span className="text-[11px] text-slate-400 font-medium">Observed Extreme</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Compliance</span>
            <span className="text-base">✅</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{data.summary.targetCompliancePct}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Within 72h SLA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exceeds Target</span>
            <span className="text-base">🚨</span>
          </div>
          <div className="text-xl font-black text-rose-600">{(100 - data.summary.targetCompliancePct).toFixed(2)}%</div>
          <span className="text-[11px] text-rose-500 font-medium">SLA Breaches</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Average Release Time</h3>
          {loading ? <LoadingSpinner /> : data.series.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={data.series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis unit="h" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageHours" stroke="#4f46e5" activeDot={{ r: 8 }} name="Avg Hours" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow h-96">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Release Time Distribution</h3>
          {loading ? <LoadingSpinner /> : data.distribution.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.distribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#10b981" name="% of Shipments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottleneck Ranking (FR-TRS-008) */}
      {data.bottleneckRanking && data.bottleneckRanking.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Port Bottleneck Ranking (Avg Release Time)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Port</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Avg Hours</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Shipments</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.bottleneckRanking.map((port, idx) => (
                  <tr 
                    key={port.portId} 
                    className={`border-b cursor-pointer hover:bg-gray-100 ${port.exceedsTarget ? 'bg-red-50' : ''}`}
                    onClick={() => dispatch(setPortId(port.portId))}
                  >
                    <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{port.portName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{port.averageHours} hrs</td>
                    <td className="px-4 py-3 text-right text-gray-700">{port.shipmentCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {port.exceedsTarget ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Exceeds 72h Target
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Within Target
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrsAnalysis;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setDateRange, setPortId, setHsCode, resetFilters } from '../../store/slices/filterSlice';
import api from '../../services/api';

interface Port {
  port_id: number;
  port_name: string;
}

const GlobalFilters = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [ports, setPorts] = useState<Port[]>([]);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const res = await api.get('/ports');
        setPorts(res.data);
      } catch (err) {
        console.error('Failed to fetch ports', err);
      }
    };
    if (user) fetchPorts();
  }, [user]);

  const applyPreset = (start: string, end: string) => {
    dispatch(setDateRange({ ...filters, startDate: start, endDate: end }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full justify-between">
      {/* Filter Inputs Group */}
      <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/80 p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Start Date */}
        <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <span className="text-sm select-none">📅</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Start Date</span>
            <input 
              type="date" 
              value={filters.startDate} 
              onChange={(e) => dispatch(setDateRange({ ...filters, startDate: e.target.value }))}
              className="text-xs font-semibold text-slate-700 outline-none bg-transparent pt-0.5 cursor-pointer"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <span className="text-sm select-none">📅</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">End Date</span>
            <input 
              type="date" 
              value={filters.endDate} 
              onChange={(e) => dispatch(setDateRange({ ...filters, endDate: e.target.value }))}
              className="text-xs font-semibold text-slate-700 outline-none bg-transparent pt-0.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Port Selector */}
        <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <span className="text-sm select-none">🚢</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Customs Port</span>
            <select 
              value={filters.portId || ''} 
              onChange={(e) => dispatch(setPortId(e.target.value ? Number(e.target.value) : null))}
              className="text-xs font-semibold text-slate-700 outline-none bg-transparent pt-0.5 cursor-pointer pr-2"
            >
              <option value="">All Authorized Ports</option>
              {ports.map(p => (
                <option key={p.port_id} value={p.port_id}>{p.port_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* HS Code Filter */}
        <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <span className="text-sm select-none">📦</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">HS Code</span>
            <input 
              type="text" 
              value={filters.hsCode || ''} 
              onChange={(e) => dispatch(setHsCode(e.target.value || null))}
              placeholder="e.g. 410411, 8501"
              className="text-xs font-semibold text-slate-700 outline-none bg-transparent pt-0.5 w-32 placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Quick Presets & Reset */}
      <div className="flex items-center space-x-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">⚡ Presets:</span>
        <button
          onClick={() => applyPreset('2025-01-01', '2025-12-31')}
          className="text-xs font-semibold px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          2025
        </button>
        <button
          onClick={() => applyPreset('2026-01-01', '2026-12-31')}
          className="text-xs font-semibold px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          2026
        </button>
        <button
          onClick={() => applyPreset('2025-01-01', '2026-12-31')}
          className="text-xs font-semibold px-2.5 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          All Time
        </button>
        <button
          onClick={() => dispatch(resetFilters())}
          title="Reset All Filters"
          className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default GlobalFilters;

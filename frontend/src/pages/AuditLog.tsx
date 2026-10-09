import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

const AuditLog = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await api.get('/admin/audit-logs?pageSize=200');
        setRowData(res.data.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("You do not have permission to view the Audit Log.");
        } else {
          setError("Failed to load audit logs.");
        }
      }
    };
    fetchAudit();
  }, []);

  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'log_id', headerName: 'ID', width: 90 },
    { field: 'user_email', headerName: 'User Email', width: 200 },
    { field: 'action', headerName: 'Action', width: 180 },
    { field: 'entity_type', headerName: 'Entity Type', width: 150 },
    { field: 'entity_id', headerName: 'Entity ID', width: 150 },
    { 
      field: 'ip_address', 
      headerName: 'IP', 
      width: 170,
      valueFormatter: p => {
        if (!p.value) return '-';
        if (p.value === '::1' || p.value === '::ffff:127.0.0.1') return '127.0.0.1 (Localhost)';
        return String(p.value).replace(/^::ffff:/, '');
      }
    },
    { field: 'created_at', headerName: 'Timestamp', width: 180, valueFormatter: p => new Date(p.value).toLocaleString() },
  ], []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-7 pb-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>📜</span>
            <span>System Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Immutable tracking trail of authentication events, rule mutations, and administrative activities.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <span>🔒 Tamper-Proof Audit Vault</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[460px] bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col hover:shadow-md transition-shadow">
        <div className="ag-theme-alpine w-full flex-1">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={20}
            domLayout="normal"
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLog;

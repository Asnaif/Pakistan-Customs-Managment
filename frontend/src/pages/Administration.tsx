import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

const Administration = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("You do not have permission to view the Administration panel.");
        } else {
          setError("Failed to load users.");
        }
      }
    };
    fetchUsers();
  }, []);

  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'user_id', headerName: 'ID', width: 90 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role_name', headerName: 'Role', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created_at', headerName: 'Created At', width: 180, valueFormatter: p => new Date(p.value).toLocaleString() },
  ], []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-7 pb-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>⚙️</span>
            <span>User Administration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage system operators, assign port scopes, and configure Role-Based Access Control (RBAC).
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200/80 shadow-2xs">
          <span>🔒 RBAC Enforced</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[460px] bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col hover:shadow-md transition-shadow">
        <div className="ag-theme-alpine w-full flex-1">
          <AgGridReact
            rowData={users}
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

export default Administration;

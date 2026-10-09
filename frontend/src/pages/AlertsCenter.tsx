import { useEffect, useState, useMemo } from 'react';
import { metricsService } from '../services/metricsService';
import { Alert } from '../types/api';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

const AlertsCenter = () => {
  const [rowData, setRowData] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await metricsService.getAlerts(1, 100);
      setRowData(res.data);
    } catch (error) {
      console.error("Failed fetching alerts", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string | number) => {
    try {
      await metricsService.acknowledgeAlert(id as any);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'alert_id', headerName: 'ID', width: 110 },
    { field: 'rule_id', headerName: 'Rule ID', width: 140 },
    { 
      headerName: 'Metric', 
      width: 200,
      valueGetter: p => p.data.metric_code || p.data.rule_metric || ''
    },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      cellStyle: p => p.value === 'Critical' ? { color: '#ef4444', fontWeight: 'bold' } : { color: '#f59e0b', fontWeight: 'normal' }
    },
    { 
      field: 'observed_value', 
      headerName: 'Observed', 
      width: 120,
      valueFormatter: p => p.value !== undefined ? Number(p.value).toLocaleString() : '-'
    },
    { 
      field: 'threshold_value', 
      headerName: 'Threshold', 
      width: 120,
      valueFormatter: p => p.value !== undefined ? Number(p.value).toLocaleString() : '-'
    },
    { field: 'status', headerName: 'Status', width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value === 'AUTO_RESOLVED') {
          return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Auto-Resolved</span>;
        }
        if (params.value === 'ACKNOWLEDGED') {
          return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">Acknowledged</span>;
        }
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">New</span>;
      }
    },
    { field: 'created_at', headerName: 'Created At', width: 180, valueFormatter: p => new Date(p.value).toLocaleString() },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.data.status === 'NEW') {
          return (
            <button 
              onClick={() => handleAcknowledge(params.data.alert_id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          );
        }
        return <span className="text-gray-400 text-xs italic">No actions available</span>;
      }
    }
  ], []);

  return (
    <div className="space-y-7 pb-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2.5">
            <span>🔔</span>
            <span>Alerts Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Threshold breaches, automatic SLA triggers, and operational alert lifecycle management.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/80 shadow-2xs">
          <span>⚙️ Rule-Engine Active</span>
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

export default AlertsCenter;

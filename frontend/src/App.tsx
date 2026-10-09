import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import TrsAnalysis from './pages/TrsAnalysis';
import RevenueIntelligence from './pages/RevenueIntelligence';
import Enforcement from './pages/Enforcement';
import OrgScorecard from './pages/OrgScorecard';
import AlertsCenter from './pages/AlertsCenter';
import Administration from './pages/Administration';
import AuditLog from './pages/AuditLog';
import AiAssistant from './pages/AiAssistant';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="trs" element={<TrsAnalysis />} />
          <Route path="revenue" element={<RevenueIntelligence />} />
          <Route path="enforcement" element={<Enforcement />} />
          <Route path="org" element={<OrgScorecard />} />
          <Route path="alerts" element={<AlertsCenter />} />
          <Route path="ai-copilot" element={<AiAssistant />} />
          <Route path="admin" element={<Administration />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';

const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const LandingGrid = lazy(() => import('./components/layout/LandingGrid'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const IncidentPage = lazy(() => import('./pages/itsm/IncidentPage'));
const ServiceRequestPage = lazy(() => import('./pages/itsm/ServiceRequestPage'));
const SLAPage = lazy(() => import('./pages/itsm/SLAPage'));
const ProblemPage = lazy(() => import('./pages/itsm/ProblemPage'));
const ChangePage = lazy(() => import('./pages/itsm/ChangePage'));
const RiskPage = lazy(() => import('./pages/itsm/RiskPage'));
const M365Page = lazy(() => import('./pages/itam/M365Page'));
const EntraPage = lazy(() => import('./pages/itam/EntraPage'));
const AssetPage = lazy(() => import('./pages/itam/AssetPage'));
const LifecyclePage = lazy(() => import('./pages/itam/LifecyclePage'));
const ServiceScopePage = lazy(() => import('./pages/itam/ServiceScopePage'));
const ObservabilityPage = lazy(() => import('./pages/itom/ObservabilityPage'));
const BizAppsPage = lazy(() => import('./pages/itom/BizAppsPage'));
const TechAppsPage = lazy(() => import('./pages/itom/TechAppsPage'));
const FinOpsPage = lazy(() => import('./pages/optimization/FinOpsPage'));
const FinOpsMaturityPage = lazy(() => import('./pages/optimization/FinOpsMaturityPage'));
const CCOEPage = lazy(() => import('./pages/optimization/CCOEPage'));

// Admin portal
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const LoginPage = lazy(() => import('./admin/LoginPage'));
const UploadPage = lazy(() => import('./admin/UploadPage'));
const SourceConfig = lazy(() => import('./admin/SourceConfig'));
const UploadHistory = lazy(() => import('./admin/UploadHistory'));
const DataHealth = lazy(() => import('./admin/DataHealth'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/dashboards" element={<LandingGrid />} />
            <Route path="/dashboard" element={<AppShell />}>
              <Route path="incident" element={<ErrorBoundary><IncidentPage /></ErrorBoundary>} />
              <Route path="sr" element={<ErrorBoundary><ServiceRequestPage /></ErrorBoundary>} />
              <Route path="sla" element={<ErrorBoundary><SLAPage /></ErrorBoundary>} />
              <Route path="problem" element={<ErrorBoundary><ProblemPage /></ErrorBoundary>} />
              <Route path="change" element={<ErrorBoundary><ChangePage /></ErrorBoundary>} />
              <Route path="risk" element={<ErrorBoundary><RiskPage /></ErrorBoundary>} />
              <Route path="m365" element={<ErrorBoundary><M365Page /></ErrorBoundary>} />
              <Route path="entra" element={<ErrorBoundary><EntraPage /></ErrorBoundary>} />
              <Route path="asset" element={<ErrorBoundary><AssetPage /></ErrorBoundary>} />
              <Route path="lifecycle" element={<ErrorBoundary><LifecyclePage /></ErrorBoundary>} />
              <Route path="servicescope" element={<ErrorBoundary><ServiceScopePage /></ErrorBoundary>} />
              <Route path="observability" element={<ErrorBoundary><ObservabilityPage /></ErrorBoundary>} />
              <Route path="bizapps" element={<ErrorBoundary><BizAppsPage /></ErrorBoundary>} />
              <Route path="techapps" element={<ErrorBoundary><TechAppsPage /></ErrorBoundary>} />
              <Route path="finops" element={<ErrorBoundary><FinOpsPage /></ErrorBoundary>} />
              <Route path="finops-maturity" element={<ErrorBoundary><FinOpsMaturityPage /></ErrorBoundary>} />
              <Route path="ado" element={<ErrorBoundary><CCOEPage /></ErrorBoundary>} />
            </Route>

            {/* Admin portal */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/upload" replace />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="sources" element={<SourceConfig />} />
              <Route path="history" element={<UploadHistory />} />
              <Route path="health" element={<DataHealth />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

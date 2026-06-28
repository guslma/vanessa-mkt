import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { TarefasPage } from './pages/TarefasPage';
import { CalendarioPage } from './pages/CalendarioPage';
import { EmpreendimentosPage } from './pages/EmpreendimentosPage';
import { PublicoPage } from './pages/PublicoPage';
import { UsersPage } from './pages/UsersPage';

// Leaflet só é necessário nesta página — carregada à parte para não pesar o bundle inicial.
const MapaPage = lazy(() => import('./pages/MapaPage').then((m) => ({ default: m.MapaPage })));

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/publico/:token" element={<PublicoPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/quadro" element={<KanbanPage />} />
              <Route path="/tarefas" element={<TarefasPage />} />
              <Route path="/calendario" element={<CalendarioPage />} />
              <Route path="/empreendimentos" element={<EmpreendimentosPage />} />
              <Route
                path="/mapa"
                element={(
                  <Suspense fallback={<p className="text-sm text-slate-500 dark:text-slate-400">Carregando mapa...</p>}>
                    <MapaPage />
                  </Suspense>
                )}
              />
              <Route path="/usuarios" element={<AdminRoute><UsersPage /></AdminRoute>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.8.0
// DATE: 07-02-2026
// HOUR: 17:35
// PURPOSE: Enrutamiento optimizado sin página intermedia de unión.
// CHANGE LOG: Eliminación de JoinRoomPage. Flujo directo Login -> Dashboard.
// SPEC REF: Requisito P.1 - Flujo Directo
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DecisionPage from './pages/DecisionPage';
import AdminPage from './pages/AdminPage';         // La Consola de Juego (Ranking, Fases)
import AdminLobbyPage from './pages/AdminLobbyPage'; // El Lobby (Crear/Borrar Salas)

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-blue-400 font-mono animate-pulse">
      [SISTEMA] VERIFICANDO CREDENCIALES...
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // Validación de Rol: Si requiere admin y no lo es, enviar al Dashboard
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  // NOTA: Ya no interceptamos al estudiante sin sala aquí.
  // El Dashboard se encargará de mostrar un estado vacío o el Login de exigir el código.

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* RUTA RAÍZ INTELIGENTE */}
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* RUTAS DE ESTUDIANTE */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/decision" element={<ProtectedRoute><DecisionPage /></ProtectedRoute>} />

        {/* RUTAS DE ADMINISTRADOR */}
        
        {/* 1. El Lobby: Donde gestiona las salas */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLobbyPage />
          </ProtectedRoute>
        } />

        {/* 2. La Consola: Donde controla UNA partida específica */}
        <Route path="/admin/console/:gameId" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        } />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.6.0
// DATE: 02-02-2026
// HOUR: 23:50
// PURPOSE: Enrutamiento con interceptor de salas y seguridad RBAC.
// CHANGE LOG: Adicion de JoinRoomPage y logica de redireccion de flujo inicial.
// SPEC REF: Requisitos Funcionales - Gestion de Partidas
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DecisionPage from './pages/DecisionPage';
import AdminPage from './pages/AdminPage';
import JoinRoomPage from './pages/JoinRoomPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-blue-400 font-mono italic animate-pulse">[SISTEMA] AUTENTICANDO...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  // Interceptor: Si el estudiante no tiene juego asignado, va a JoinRoom (excepto si ya va hacia alla)
  if (user.role === 'student' && !user.companyId?.gameId && !window.location.pathname.includes('join-room')) {
     // Nota: Esta validacion se refinara cuando el objeto user este totalmente poblado
  }

  return children;
};

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join-room" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/decision" element={<ProtectedRoute><DecisionPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
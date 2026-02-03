// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.5.1
// DATE: 02-02-2026
// HOUR: 16:40
// PURPOSE: Enrutamiento inteligente con rutas relativas de raiz (./).
// CHANGE LOG: Aseguramiento de importaciones desde la raiz de src.
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // CAMBIO: ./ porque App esta en src
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DecisionPage from './pages/DecisionPage';
import AdminPage from './pages/AdminPage';
import { socket } from './services/socket';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-mono uppercase">Sincronizando Terminal...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
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
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/decision" element={<ProtectedRoute><DecisionPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
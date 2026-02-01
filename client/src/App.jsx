// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.2.0
// DATE: 31-01-2026
// HOUR: 14:30
// PURPOSE: Enrutamiento y vista de bienvenida con créditos.
// CHANGE LOG: Inclusión de créditos en Dashboard y lógica de protección corregida.
// SPEC REF: Requisitos No Funcionales - UX
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">INICIALIZANDO TERMINAL...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-2xl w-full bg-white p-12 rounded-3xl shadow-xl border border-slate-200 text-center">
        <h1 className="text-4xl font-bold text-navy-900">
          Bienvenido, <span className="text-electric-500">{user?.email}</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg">
          Has ingresado exitosamente al Centro de Operaciones de ElectroNova Inc.
        </p>
        <div className="mt-10 p-4 bg-profit/10 text-profit rounded-xl font-bold border border-profit/20">
          SISTEMA OPERATIVO: ONLINE
        </div>
        <button 
          onClick={logout}
          className="mt-8 text-risk font-bold hover:underline"
        >
          Cerrar Sesión Segura
        </button>
      </div>
      <footer className="mt-12 text-slate-500 text-sm font-medium">
        © Maribel Pinheiro & Miguel González | Ene-2026
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
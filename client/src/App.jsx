// ============================================
// FILE: /client/src/App.jsx
// VERSION: 1.3.0
// DATE: 31-01-2026
// HOUR: 15:30
// PURPOSE: Enrutamiento oficial con Dashboard real.
// CHANGE LOG: Sustitucion del placeholder por DashboardPage.
// SPEC REF: Requisitos No Funcionales - UX
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DecisionPage from './pages/DecisionPage'; // NUEVO

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 text-white font-mono uppercase tracking-tighter">
      Iniciando Terminal de Estrategia...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
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
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/decision" element={<ProtectedRoute> <DecisionPage /> </ProtectedRoute> } />
      </Routes>
    </Router>
  );
}

export default App;
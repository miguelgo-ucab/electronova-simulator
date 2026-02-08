// ============================================
// FILE: /client/src/context/AuthContext.jsx
// VERSION: 1.6.0
// DATE: 07-02-2026
// HOUR: 20:30
// PURPOSE: Gestión de identidad con captura de errores para Smart Auth.
// CHANGE LOG: Mejora de logs y retorno de estados HTTP para lógica de registro.
// SPEC REF: Requisitos Funcionales - Autenticación
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleSessionData = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      handleSessionData(response.data.token, response.data.data.user);
      return { success: true };
    } catch (error) {
      // Retornamos el estatus para que la UI sepa si el usuario no existe (401/404)
      return { 
        success: false, 
        status: error.response?.status,
        message: error.response?.data?.message || 'Credenciales inválidas.' 
      };
    }
  };

  const register = async (email, password, role) => {
    try {
      const response = await api.post('/auth/signup', { email, password, role });
      handleSessionData(response.data.token, response.data.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error crítico en el registro.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// ============================================
// FILE: /client/src/context/AuthContext.jsx
// VERSION: 1.0.0
// DATE: 31-01-2026
// HOUR: 13:40
// PURPOSE: Gestion global del estado de autenticacion del usuario.
// CHANGE LOG: Funciones de login, logout y persistencia en localStorage.
// SPEC REF: Requisitos Extraidos - Seccion 2 (Autenticacion)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si ya habia una sesion guardada
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Funcion para iniciar sesion
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;

      // Guardar en el navegador (Persistencia)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al conectar con el servidor' 
      };
    }
  };

  // Funcion para cerrar sesion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto facilmente
export const useAuth = () => useContext(AuthContext);
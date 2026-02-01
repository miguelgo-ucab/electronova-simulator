// ============================================
// FILE: /client/src/context/AuthContext.jsx
// VERSION: 1.3.0
// DATE: 31-01-2026
// HOUR: 14:15
// PURPOSE: Gestion de autenticacion con logs de depuracion y correccion de sintaxis.
// CHANGE LOG: Eliminacion de funciones duplicadas y cierre correcto de llaves.
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

  // Persistencia de sesion al cargar la pagina
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Funcion Unica de Login
  const login = async (email, password) => {
    try {
      console.log('--- INICIANDO PETICION DE LOGIN ---');
      console.log('Email:', email);
      console.log('URL Base de API:', api.defaults.baseURL);

      const response = await api.post('/auth/login', { email, password });
      
      console.log('Respuesta Exitosa:', response.data);

      const { token, data } = response.data;

      // Guardar en el almacenamiento local del navegador
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('--- ERROR EN CAPA DE AUTENTICACION ---');
      if (error.response) {
        // El servidor respondio con un error (401, 400, etc)
        console.error('Data del Error:', error.response.data);
        return { 
          success: false, 
          message: error.response.data.message || 'Credenciales invalidas' 
        };
      } else if (error.request) {
        // La peticion se hizo pero el servidor no respondio (Backend apagado o CORS)
        console.error('Servidor no responde. Verifique que el Backend (Puerto 5000) este encendido.');
        return { success: false, message: 'El servidor de simulacion no responde.' };
      } else {
        console.error('Error de configuracion:', error.message);
        return { success: false, message: 'Error critico de conexion.' };
      }
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
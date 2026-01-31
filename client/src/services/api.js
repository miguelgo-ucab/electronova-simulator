// ============================================
// FILE: /client/src/services/api.js
// VERSION: 1.0.0
// DATE: 31-01-2026
// HOUR: 13:30
// PURPOSE: Instancia centralizada de Axios para peticiones al Backend.
// CHANGE LOG: Implementacion de interceptor para adjuntar el JWT automaticamente.
// SPEC REF: Resumen de arquitectura de conexion - Seccion 2.A
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: Antes de cada peticion, busca el token en el navegador y lo pega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
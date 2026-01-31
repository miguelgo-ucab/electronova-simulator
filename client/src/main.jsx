// ============================================
// FILE: /client/src/main.jsx
// VERSION: 1.1.0
// DATE: 31-01-2026
// HOUR: 13:50
// PURPOSE: Punto de entrada de React con proveedores de contexto.
// CHANGE LOG: Inclusion del AuthProvider para gestionar la seguridad global.
// SPEC REF: Seccion 4.2 - Autenticacion y Contexto
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
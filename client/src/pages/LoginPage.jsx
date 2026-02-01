// ============================================
// FILE: /client/src/pages/LoginPage.jsx
// VERSION: 1.2.0
// DATE: 31-01-2026
// HOUR: 14:35
// PURPOSE: Interfaz de acceso con redireccion automatica tras login exitoso.
// CHANGE LOG: Integracion de useNavigate para enviar al usuario al Dashboard.
// SPEC REF: Requisitos No Funcionales - UX y Navegacion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // IMPORTANTE: El GPS
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate(); // Inicializar el navegador

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      // Si el login es correcto, enviamos al usuario al Dashboard
      console.log('Navegando al Dashboard...');
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-navy-900 p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            ElectroNova <span className="text-electric-500">Inc.</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-mono uppercase tracking-widest">
            Business Simulator v1.0
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-risk p-4 flex items-center gap-3">
                <AlertCircle className="text-risk w-5 h-5" />
                <p className="text-risk text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-electric-500 outline-none transition-all"
                  placeholder="ejemplo@electronova.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-electric-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <LogIn size={20} />
              INGRESAR AL SISTEMA
            </button>
          </form>
        </div>
      </div>
      
      <footer className="mt-8 text-slate-500 text-sm font-medium">
        © Maribel Pinheiro & Miguel González | Ene-2026
      </footer>
    </div>
  );
};

export default LoginPage;
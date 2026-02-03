// ============================================
// FILE: /client/src/pages/LoginPage.jsx
// VERSION: 1.4.0
// DATE: 02-02-2026
// HOUR: 16:35
// PURPOSE: Interfaz de acceso con rutas relativas corregidas (../).
// CHANGE LOG: Correccion de ruta de importacion de AuthContext.
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // CAMBIO: ../ para subir de carpeta
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0F172A] p-8 text-center border-b border-slate-800">
          <h1 className="text-3xl font-black text-white tracking-tight">
            ElectroNova <span className="text-blue-500">Inc.</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Strategic Simulation System</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <p className="text-red-700 text-xs font-bold uppercase">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input type="email" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="usuario@electronova.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Acceso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input type="password" required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-xs tracking-widest">
              <LogIn size={18} /> INICIAR SESIÓN
            </button>
          </form>
        </div>
      </div>
      <footer className="mt-10 text-center">
        <p className="text-slate-400 text-[10px] font-black tracking-[0.2em]">© MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026</p>
      </footer>
    </div>
  );
};

export default LoginPage;
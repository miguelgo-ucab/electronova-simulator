// ============================================
// FILE: /client/src/pages/LoginPage.jsx
// VERSION: 1.5.0
// DATE: 03-02-2026
// HOUR: 08:20
// PURPOSE: Login profesional con separacion de roles mediante pestañas.
// CHANGE LOG: Implementacion de Tabs (Profesor/Estudiante) y estetica Corporate Tech.
// SPEC REF: Manual de Estilo - Seccion 1 (The Strategic Dashboard)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserCircle, ShieldCheck, Mail, Lock, AlertCircle, Cpu } from 'lucide-react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' o 'professor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      // Rigor de Seguridad: Validar que el rol coincida con la pestaña elegida
      if (activeTab === 'professor' && user.role !== 'admin') {
        setError('ESTA TERMINAL ES EXCLUSIVA PARA PERSONAL DOCENTE.');
        setLoading(false);
        return;
      }
      
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const COLORS = {
    navy: '#0F172A',
    blue: '#3B82F6',
    slate: '#F8FAFC'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" 
         style={{ backgroundColor: activeTab === 'professor' ? COLORS.navy : COLORS.slate, transition: 'all 0.5s ease' }}>
      
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        {/* CABECERA DINÁMICA */}
        <div className="p-10 text-center border-b border-slate-100" 
             style={{ backgroundColor: activeTab === 'professor' ? '#1E293B' : '#FFFFFF' }}>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <Cpu className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter" 
              style={{ color: activeTab === 'professor' ? '#FFFFFF' : COLORS.navy }}>
            ElectroNova <span className="text-blue-500">Inc.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-slate-400">
            {activeTab === 'professor' ? 'Master Control Terminal' : 'Student Strategy Portal'}
          </p>
        </div>

        {/* SELECTOR DE ROL (TABS) */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => {setActiveTab('student'); setError('');}}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all
            ${activeTab === 'student' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          >
            <UserCircle size={14} /> Estudiante
          </button>
          <button 
            onClick={() => {setActiveTab('professor'); setError('');}}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all
            ${activeTab === 'professor' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={14} /> Profesor
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 animate-pulse">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-red-700 text-[10px] font-black uppercase">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                placeholder="usuario@electronova.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3"
          >
            {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
            <LogIn size={18} />
          </button>
        </form>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-slate-500 text-[10px] font-black tracking-[0.4em]"
           style={{ color: activeTab === 'professor' ? '#475569' : '#94A3B8' }}>
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
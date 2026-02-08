// ============================================
// FILE: /client/src/pages/LoginPage.jsx
// VERSION: 2.4.0
// DATE: 07-02-2026
// HOUR: 20:35
// PURPOSE: Interfaz de acceso con detección automática de usuarios nuevos.
// CHANGE LOG: Implementación de flujo Smart Auth y footer oficial.
// SPEC REF: Requisito P.1 - Flujo Unificado
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, UserCircle, ShieldCheck, Mail, Lock, AlertCircle, Cpu, Hash, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('student'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSmartAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMsg('Sincronizando con el servidor...');
    
    const targetRole = activeTab === 'professor' ? 'admin' : 'student';

    // 1. INTENTO DE LOGIN
    let result = await login(email, password);

    // 2. SI EL LOGIN FALLA (Usuario no existe), INTENTAR REGISTRO
    if (!result.success) {
      setStatusMsg('Usuario nuevo detectado. Creando credenciales...');
      const regResult = await register(email, password, targetRole);
      
      if (!regResult.success) {
        setError(regResult.message);
        setLoading(false);
        setStatusMsg('');
        return;
      }
    }

    // 3. VALIDACIÓN DE ROL POST-ACCESO
    const user = JSON.parse(localStorage.getItem('user'));
    if (activeTab === 'professor' && user.role !== 'admin') {
      setError('ESTA TERMINAL REQUIERE PERMISOS DOCENTES.');
      setLoading(false); return;
    }

    // 4. VINCULACIÓN A SALA (Solo Estudiantes)
    if (user.role === 'student' && gameCode) {
      setStatusMsg('Vinculando a sala de simulación...');
      try {
        await api.post('/games/join', { gameCode });
      } catch (err) {
        setError('AVISO: Acceso concedido, pero el CÓDIGO DE SALA es erróneo.');
      }
    }

    // 5. REDIRECCIÓN
    if (user.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const COLORS = { navy: '#0F172A', blue: '#3B82F6', slate: '#F8FAFC' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-all duration-500" 
         style={{ backgroundColor: activeTab === 'professor' ? COLORS.navy : COLORS.slate }}>
      
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-8 text-center border-b border-slate-100 transition-colors duration-300" 
             style={{ backgroundColor: activeTab === 'professor' ? '#1E293B' : '#FFFFFF' }}>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
              <Cpu size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter" style={{ color: activeTab === 'professor' ? '#FFFFFF' : COLORS.navy }}>
            ElectroNova <span className="text-blue-500">Inc.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-slate-400">
            {activeTab === 'professor' ? 'Master Control Terminal' : 'Student Strategy Portal'}
          </p>
        </div>

        <div className="flex border-b border-slate-100">
          <button onClick={() => {setActiveTab('student'); setError('');}} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'student' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
            <UserCircle size={14} /> Estudiante
          </button>
          <button onClick={() => {setActiveTab('professor'); setError('');}} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'professor' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
            <ShieldCheck size={14} /> Profesor
          </button>
        </div>

        <form onSubmit={handleSmartAuth} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={16} />
              <p className="text-red-700 text-[10px] font-black uppercase">{error}</p>
            </div>
          )}
          
          {loading && !error && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-center animate-pulse">
              <p className="text-blue-700 text-[10px] font-black uppercase tracking-tighter">{statusMsg}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="email" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" placeholder="usuario@electronova.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="password" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {activeTab === 'student' && (
            <div className="space-y-1 pt-2 border-t border-dashed border-slate-200">
              <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Código de Sala (Obligatorio)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                <input type="text" required className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border-2 border-blue-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-sm uppercase tracking-wider placeholder:text-slate-300" placeholder="EJ: ALPHA" value={gameCode} onChange={(e) => setGameCode(e.target.value)} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 mt-4">
            {loading ? 'PROCESANDO...' : 'INGRESAR AL SISTEMA'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-slate-500 text-[10px] font-black tracking-[0.2em]" style={{ color: activeTab === 'professor' ? '#475569' : '#94A3B8' }}>
          © Maribel Pinheiro & Miguel González | Ene-2026
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
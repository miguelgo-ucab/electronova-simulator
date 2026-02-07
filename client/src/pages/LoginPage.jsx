// ============================================
// FILE: /client/src/pages/LoginPage.jsx
// VERSION: 2.0.0
// DATE: 07-02-2026
// HOUR: 11:40
// PURPOSE: Login unificado con capacidad de inscripción inmediata a sala.
// CHANGE LOG: Adición de campo GameCode y lógica de joinGame post-login.
// SPEC REF: Requisito de Flujo Estudiante
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Necesario para el Auto-Join
import { LogIn, UserCircle, ShieldCheck, Mail, Lock, AlertCircle, Cpu, Hash } from 'lucide-react';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gameCode, setGameCode] = useState(''); // Nuevo Estado
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 1. INTENTO DE LOGIN
    const result = await login(email, password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Validación de Rol Cruzado
      if (activeTab === 'professor' && user.role !== 'admin') {
        setError('ESTA TERMINAL ES EXCLUSIVA PARA PERSONAL DOCENTE.');
        setLoading(false);
        return;
      }

      // 2. AUTO-JOIN (Solo si es estudiante y escribió un código)
      if (activeTab === 'student' && gameCode && user.role === 'student') {
        try {
          console.log('[AUTO-JOIN] Intentando unir a sala:', gameCode);
          // Usamos la instancia de api que ya tiene el interceptor con el token nuevo
          await api.post('/games/join', { gameCode: gameCode });
          console.log('[AUTO-JOIN] Éxito.');
        } catch (joinErr) {
          console.warn('[AUTO-JOIN] Falló:', joinErr);
          // No detenemos el login, pero avisamos o dejamos que el router lo maneje
          // El ProtectedRoute lo enviará a JoinRoomPage si falló la inscripción
        }
      }
      
      // 3. REDIRECCIÓN
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard'); // El ProtectedRoute decidirá si va al Dashboard o JoinRoom
      
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const COLORS = { navy: '#0F172A', blue: '#3B82F6', slate: '#F8FAFC' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500" 
         style={{ backgroundColor: activeTab === 'professor' ? COLORS.navy : COLORS.slate }}>
      
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <div className="p-10 text-center border-b border-slate-100 transition-colors duration-300" 
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

        {/* TABS */}
        <div className="flex border-b border-slate-100">
          <button onClick={() => {setActiveTab('student'); setError('');}} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'student' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
            <UserCircle size={14} /> Estudiante
          </button>
          <button onClick={() => {setActiveTab('professor'); setError('');}} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'professor' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
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
              <input type="email" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" placeholder="usuario@electronova.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="password" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {/* CAMPO DE CÓDIGO DE SALA (Solo Estudiante) */}
          {activeTab === 'student' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Código de Sala (Opcional)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-sm uppercase tracking-wider placeholder:font-medium placeholder:text-slate-300" 
                  placeholder="EJ: ALPHA" 
                  value={gameCode} 
                  onChange={(e) => setGameCode(e.target.value)} 
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 text-[11px] tracking-[0.2em] flex items-center justify-center gap-3">
            {loading ? 'ACCEDIENDO...' : 'ENTRAR AL SISTEMA'}
            <LogIn size={18} />
          </button>
        </form>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-slate-500 text-[10px] font-black tracking-[0.4em]" style={{ color: activeTab === 'professor' ? '#475569' : '#94A3B8' }}>
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
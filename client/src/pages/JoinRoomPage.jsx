// ============================================
// FILE: /client/src/pages/JoinRoomPage.jsx
// VERSION: 1.1.0
// DATE: 07-02-2026
// HOUR: 11:50
// PURPOSE: Página de respaldo para ingreso de código con MainLayout.
// CHANGE LOG: Adaptación a estructura SaaS Premium.
// SPEC REF: Requisito de Flujo Estudiante
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { DoorOpen, ArrowRight, Hash, LogOut } from 'lucide-react';

const JoinRoomPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/games/join', { gameCode: code });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Código de sala no válido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout className="bg-[#F1F5F9] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 m-4">
        <div className="bg-[#0F172A] p-10 text-center border-b border-slate-800">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <DoorOpen className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">VINCULACIÓN DE SALA</h2>
          <p className="text-slate-400 text-xs mt-3 font-medium uppercase tracking-widest">
            Bienvenido, <span className="text-white">{user?.email}</span>
          </p>
        </div>

        <form onSubmit={handleJoin} className="p-10 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 uppercase tracking-tight text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Código de Sala</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" required
                placeholder="EJ: ALPHA"
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-black text-xl tracking-widest uppercase transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#3B82F6] hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'VINCULANDO...' : 'INGRESAR A LA PARTIDA'}
              <ArrowRight size={20} />
            </button>

            <button 
              type="button"
              onClick={logout}
              className="w-full py-3 text-slate-400 font-bold text-xs hover:text-red-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Cambiar Cuenta
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default JoinRoomPage;
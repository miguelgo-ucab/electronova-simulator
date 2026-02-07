// ============================================
// FILE: /client/src/pages/JoinRoomPage.jsx
// VERSION: 1.0.0
// DATE: 02-02-2026
// HOUR: 23:55
// PURPOSE: Interfaz para que el estudiante se vincule a una sala mediante codigo.
// CHANGE LOG: Diseño de alta fidelidad con validacion de GameCode.
// SPEC REF: Seccion 5.1 - Formulario de Decisiones
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DoorOpen, ArrowRight, Hash } from 'lucide-react';

const JoinRoomPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/games/join', { gameCode: code });
      // Forzamos recarga para actualizar el estado del usuario con su nueva sala
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Código de sala no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DoorOpen className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">ACCESO A SIMULACIÓN</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Ingrese el código de sala proporcionado por su instructor.</p>
        </div>

        <form onSubmit={handleJoin} className="p-10 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 uppercase tracking-tight">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Código de Sala</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                required
                placeholder="EJ: ALPHA"
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-black text-xl tracking-widest uppercase transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#3B82F6] hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'VALIDANDO...' : 'INGRESAR A LA PARTIDA'}
            <ArrowRight size={20} />
          </button>

          <button 
            type="button"
            onClick={logout}
            className="w-full text-slate-400 font-bold text-xs hover:text-red-500 transition-colors"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
      <footer className="mt-12 text-slate-500 text-[10px] font-black tracking-[0.3em]">
        © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
      </footer>
    </div>
  );
};

export default JoinRoomPage;
// ============================================
// FILE: /client/src/pages/AdminPage.jsx
// VERSION: 2.3.0
// DATE: 08-02-2026
// HOUR: 15:35
// PURPOSE: Consola administrativa con corrección de sala de Sockets.
// CHANGE LOG: Corrección de join-game usando gameCode en lugar de gameId.
// SPEC REF: Sección 3.5 - WebSockets
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket } from '../services/socket';
import { Users, Play, ShieldAlert, ArrowLeft, RefreshCw, Clock, Activity, Database, Mail } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const AdminPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const COLORS = { navy: '#0F172A', blue: '#3B82F6', green: '#10B981', red: '#EF4444', slate: '#1E293B' };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get(`/admin/status?gameId=${gameId}`);
      setCompanies(res.data.data.companies || []);
      setGame(res.data.data.game || null);
    } catch (err) {
      console.error('Error de sincronización:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // 1. Carga inicial de datos
  useEffect(() => { 
    if (gameId) fetchStatus(); 
  }, [gameId, fetchStatus]);

  // 2. Conexión al Socket (SOLO cuando ya tenemos el gameCode)
  useEffect(() => {
    if (game?.gameCode) {
      console.log(`[ADMIN] Conectando a sala de tiempo real: ${game.gameCode}`);
      socket.emit('join-game', game.gameCode);

      // Escuchar avance de ronda
      const handleTimeAdvance = (data) => {
        console.log('[ADMIN] Nueva ronda detectada:', data.newRound);
        fetchStatus(); // Recargar datos visuales
      };

      socket.on('timeAdvance', handleTimeAdvance);
      socket.on('roundProcessed', () => fetchStatus()); // También recargar si se cierran ventas

      return () => {
        socket.off('timeAdvance', handleTimeAdvance);
        socket.off('roundProcessed');
      };
    }
  }, [game?.gameCode, fetchStatus]);

  const runPhase = async (endpoint, label) => {
    if (!window.confirm(`¿EJECUTAR CIERRE DE ${label.toUpperCase()}?`)) return;
    setProcessing(true);
    try {
      await api.post(`/admin/${endpoint}`, { gameId, round: game?.currentRound });
      alert(`${label} procesada con éxito.`);
      // No hace falta fetchStatus manual si el socket responde, pero lo dejamos por seguridad
      fetchStatus();
    } catch (err) {
      alert('FALLO EN EL MOTOR: ' + (err.response?.data?.message || err.message));
    } finally { setProcessing(false); }
  };

  const handleAdvanceRound = async () => {
    if (!game) return;
    if (!window.confirm(`¿AVANZAR A RONDA ${game.currentRound + 1}? Esta acción es irreversible.`)) return;
    
    setProcessing(true);
    try {
      await api.post(`/games/${game._id}/advance`);
      // El socket se encargará de actualizar la UI
    } catch (err) {
      console.error(err);
      alert("ERROR AL AVANZAR RONDA: " + (err.response?.data?.message || err.message));
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿FINALIZAR SESIÓN DE ADMINISTRACIÓN?")) {
      logout();
      navigate('/login');
    }
  };

  const handleExit = () => {
    navigate('/admin');
  };

  if (loading) return (
    <MainLayout className="bg-[#0F172A] flex items-center justify-center">
      <div className="text-blue-500 font-mono animate-pulse tracking-widest text-lg">[CONECTANDO A SALA {gameId}...]</div>
    </MainLayout>
  );

  return (
    <MainLayout className="bg-[#0F172A] text-slate-100">
      
      <nav className="border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-[#0F172A]/80">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-pulse">
            <ShieldAlert style={{ color: COLORS.red }} size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            Admin <span style={{ color: COLORS.red }}>Console</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-5 py-2 rounded-xl border border-slate-700 bg-slate-900 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase">Sala Activa</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">{game?.gameCode || 'ERROR'}</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-slate-500 uppercase">Ronda</span>
              <span className="text-xs font-bold" style={{ color: COLORS.blue }}>{game?.currentRound || 0}</span>
            </div>
          </div>
          
          <button onClick={handleExit} className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">
            <ArrowLeft size={14} /> Volver al Lobby
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all ml-4 border-l border-slate-700 pl-6">
            <ArrowLeft size={14} /> Desconectar
          </button>
        </div>
      </nav>

      <div className="p-8 lg:p-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* RANKING */}
        <div className="lg:col-span-2">
          <div className="rounded-[2.5rem] p-8 lg:p-10 border border-slate-800 shadow-2xl bg-slate-900/50">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
              <h3 className="text-base font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                <Activity style={{ color: COLORS.blue }} size={18} /> Monitor: {game?.gameCode}
              </h3>
              <button onClick={fetchStatus} className="p-2 hover:bg-slate-800 rounded-full transition-all">
                <RefreshCw size={18} className={processing ? 'animate-spin' : ''} />
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <tr>
                  <th className="pb-6">Corporación / Estudiante</th>
                  <th className="pb-6">Capital</th>
                  <th className="pb-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-5">
                      <div className="font-bold text-blue-400">{c.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <Mail size={10} /> {c.ownerEmail || 'Sin email'}
                      </div>
                    </td>
                    <td className="py-5 font-mono font-bold text-white tracking-tight">
                      $ {new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(c.cash)}
                    </td>
                    <td className="py-5 text-center">
                      <span className="px-3 py-1 rounded-md text-[9px] font-black border uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONTROLES */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] p-8 lg:p-10 border border-slate-800 shadow-2xl bg-slate-900/50">
            <h3 className="text-base font-black mb-8 flex items-center gap-3 uppercase tracking-[0.2em]" style={{ color: COLORS.red }}>
              <Database size={18} /> Control de Ciclo
            </h3>
            <div className="space-y-3">
              <PhaseButton label="1. Abastecimiento" onClick={() => runPhase('process-procurement', 'Abastecimiento')} disabled={processing} color={COLORS.slate} />
              <PhaseButton label="2. Manufactura" onClick={() => runPhase('process-production', 'Manufactura')} disabled={processing} color={COLORS.slate} />
              <PhaseButton label="3. Logística" onClick={() => runPhase('process-logistics', 'Logística')} disabled={processing} color={COLORS.slate} />
              <PhaseButton label="4. MERCADO" onClick={() => runPhase('process-sales', 'Ventas')} disabled={processing} color={COLORS.red} isDanger />
            </div>
            <div className="mt-10 pt-8 border-t border-slate-800 text-center">
              <button 
                onClick={handleAdvanceRound}
                disabled={processing}
                style={{ backgroundColor: COLORS.blue }}
                className="w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50"
              >
                <Clock size={18} /> <span className="text-xs tracking-[0.2em] uppercase">Siguiente Ronda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="p-10 text-center border-t border-slate-800/50 mt-10">
        <p className="text-slate-600 text-[10px] font-black tracking-[0.2em]">
          © Maribel Pinheiro & Miguel González | Ene-2026
        </p>
      </footer>
    </MainLayout>
  );
};

const PhaseButton = ({ label, onClick, disabled, color, isDanger }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    style={{ 
      backgroundColor: isDanger ? `${color}15` : color,
      color: isDanger ? color : '#94A3B8',
      borderColor: isDanger ? `${color}30` : '#334155'
    }}
    className="w-full py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-30 hover:brightness-125 text-left pl-6"
  >
    {label}
  </button>
);

export default AdminPage;
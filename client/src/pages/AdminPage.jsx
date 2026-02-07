// ============================================
// FILE: /client/src/pages/AdminPage.jsx
// VERSION: 1.4.0
// DATE: 06-02-2026
// HOUR: 19:25
// PURPOSE: Admin Panel estructurado con MainLayout.
// CHANGE LOG: Adaptación al contenedor maestro con tema oscuro.
// SPEC REF: Manual de Estilo - Sección 1
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Play, ShieldAlert, ArrowLeft, RefreshCw, Clock, Activity, Database } from 'lucide-react';
import MainLayout from '../components/MainLayout'; // NUEVO

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Paleta oficial
  const COLORS = { navy: '#0F172A', blue: '#3B82F6', green: '#10B981', red: '#EF4444', slate: '#1E293B' };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/status');
      setCompanies(res.data.data.companies || []);
      setGame(res.data.data.game || null);
    } catch (err) { console.error('Sync Error'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  const runPhase = async (endpoint, label) => {
    if (!window.confirm(`¿EJECUTAR CIERRE DE ${label.toUpperCase()}?`)) return;
    setProcessing(true);
    try {
      await api.post(`/admin/${endpoint}`);
      fetchStatus();
    } catch (err) { alert('ERROR DE MOTOR: ' + (err.response?.data?.message || 'TIMEOUT')); }
    finally { setProcessing(false); }
  };

  const handleAdvanceRound = async () => {
    if (!game) return;
    if (!window.confirm("¿AVANZAR RELOJ GLOBAL?")) return;
    try { await api.post(`/games/${game._id}/advance`); fetchStatus(); } 
    catch (err) { alert("ERROR DE SINCRONIZACIÓN."); }
  };

  const handleLogout = () => {
    if (window.confirm("¿FINALIZAR SESIÓN DE MANDO?")) {
      logout();
      navigate('/login');
    }
  };

  if (loading) return (
    <MainLayout className="bg-[#0F172A] flex items-center justify-center">
      <div className="text-blue-500 font-mono animate-pulse tracking-widest text-lg">[SECURE CONNECTION...]</div>
    </MainLayout>
  );

  return (
    // USAMOS MAINLAYOUT CON FONDO NAVY (Oscuro)
    <MainLayout className="bg-[#0F172A] text-slate-100">
      
      {/* NAV */}
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
              <span className="text-[9px] font-black text-slate-500 uppercase">Sala</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">{game?.gameCode || 'N/A'}</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-slate-500 uppercase">Ronda</span>
              <span className="text-xs font-bold" style={{ color: COLORS.blue }}>{game?.currentRound || 0}</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            <ArrowLeft size={14} /> Salir
          </button>
        </div>
      </nav>

      <div className="p-8 lg:p-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* RANKING */}
        <div className="lg:col-span-2">
          <div className="rounded-[2.5rem] p-8 lg:p-10 border border-slate-800 shadow-2xl bg-slate-900/50">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
              <h3 className="text-base font-black flex items-center gap-3 tracking-[0.2em] uppercase">
                <Activity style={{ color: COLORS.blue }} size={18} /> Monitor Activo
              </h3>
              <button onClick={fetchStatus} className="p-2 hover:bg-slate-800 rounded-full transition-all">
                <RefreshCw size={18} className={processing ? 'animate-spin' : ''} />
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
                <tr>
                  <th className="pb-6">Corp</th>
                  <th className="pb-6">Capital</th>
                  <th className="pb-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-5 font-bold text-blue-400">{c.name}</td>
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
              <Database size={18} /> Secuencia
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
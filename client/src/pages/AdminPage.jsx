// ============================================
// FILE: /client/src/pages/AdminPage.jsx
// VERSION: 1.1.1
// DATE: 02-02-2026
// HOUR: 22:30
// PURPOSE: Refinamiento visual del Command Center y visualización de sala.
// CHANGE LOG: Aseguramiento de renderizado de gameCode y estilos de alerta.
// SPEC REF: Manual de Estilo - Sección 1 (The Strategic Dashboard)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Play, ShieldAlert, ArrowLeft, RefreshCw, Clock } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/status');
      // Rigor: Acceso directo a la estructura de datos del Backend
      setCompanies(res.data.data.companies || []);
      setGame(res.data.data.game || null);
    } catch (err) {
      console.error('Error al sincronizar con la base de datos maestra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const runPhase = async (endpoint, label) => {
    if (!window.confirm(`¿Cerrar fase de ${label}?`)) return;
    setProcessing(true);
    try {
      await api.post(`/admin/${endpoint}`);
      alert(`${label} procesada con éxito.`);
      fetchStatus();
    } catch (err) {
      alert('Error en el motor de simulación: ' + (err.response?.data?.message || 'Fallo de red'));
    } finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-mono text-xl animate-pulse">
      [ACCEDIENDO A NÚCLEO DE DATOS...]
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      <nav className="bg-black/60 p-6 border-b border-red-900/40 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-red-600" size={32} />
          <h1 className="text-2xl font-black tracking-tighter uppercase">Master <span className="text-red-600">Console</span></h1>
        </div>
        
        <div className="flex items-center gap-8">
          {/* VISUALIZACIÓN DE SALA Y RONDA */}
          <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-inner">
            <Clock size={18} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Sala Activa</span>
              <span className="text-sm font-bold text-white leading-tight">{game?.gameCode || 'SALA NO DETECTADA'}</span>
            </div>
            <div className="w-px h-8 bg-slate-800 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Ronda</span>
              <span className="text-sm font-bold text-blue-500 leading-tight">{game?.currentRound || 0}</span>
            </div>
          </div>
          
          <button onClick={() => navigate('/dashboard')} className="hover:text-white text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all">
            Salir del Sistema
          </button>
        </div>
      </nav>

      <main className="p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* RANKING */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
              <h3 className="text-xl font-black flex items-center gap-4 uppercase tracking-tight">
                <Users className="text-blue-600" size={24} /> Ranking de Corporaciones
              </h3>
              <button onClick={fetchStatus} className="p-3 hover:bg-slate-800 rounded-full transition-all">
                <RefreshCw size={24} className={processing ? 'animate-spin' : ''} />
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <tr>
                  <th className="pb-6">Empresa</th>
                  <th className="pb-6">Cash Disponible</th>
                  <th className="pb-6">Ética</th>
                  <th className="pb-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 font-bold text-blue-400 text-lg">{c.name}</td>
                    <td className="py-6 font-mono font-black text-white text-xl">
                      $ {new Intl.NumberFormat('de-DE').format(c.cash)}
                    </td>
                    <td className="py-6">
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${c.ethicsIndex}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-1 block">{c.ethicsIndex}/100</span>
                    </td>
                    <td className="py-6">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-green-900/20 text-green-500 border border-green-900/50 uppercase">Operativo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONSOLA DE CONTROL */}
        <div className="space-y-10">
          <div className="bg-red-950/5 rounded-[2.5rem] p-10 border border-red-900/20 shadow-2xl">
            <h3 className="text-xl font-black text-red-600 mb-10 flex items-center gap-4 uppercase tracking-tight">
              <Play size={24} /> Control de Ciclo
            </h3>
            <div className="space-y-5">
              <AdminBtn label="Cerrar Abastecimiento" onClick={() => runPhase('process-procurement', 'Abastecimiento')} disabled={processing} />
              <AdminBtn label="Cerrar Manufactura" onClick={() => runPhase('process-production', 'Manufactura')} disabled={processing} />
              <AdminBtn label="Cerrar Logística" onClick={() => runPhase('process-logistics', 'Logística')} disabled={processing} />
              <AdminBtn label="Cerrar Mercado" onClick={() => runPhase('process-sales', 'Ventas')} disabled={processing} danger />
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.4em] text-slate-500">
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

const AdminBtn = ({ label, onClick, disabled, danger }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-20 
    ${danger ? 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-lg'} `}
  >
    {label}
  </button>
);

export default AdminPage;
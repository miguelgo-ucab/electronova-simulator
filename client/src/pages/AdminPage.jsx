// ============================================
// FILE: /client/src/pages/AdminPage.jsx
// VERSION: 1.0.0
// DATE: 02-02-2026
// HOUR: 14:50
// PURPOSE: Interfaz de gestion docente y control de rondas.
// CHANGE LOG: Implementacion de Ranking en tiempo real y botones de cierre de fase.
// SPEC REF: Seccion 5.2 - Panel de Administracion
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Play, BarChart3, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/status');
      setCompanies(res.data.data.companies);
    } catch (err) {
      alert('Error al cargar el ranking de empresas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const runPhase = async (endpoint, label) => {
    if (!window.confirm(`¿Está seguro de cerrar la fase de ${label}? Esta acción es irreversible.`)) return;
    setProcessing(true);
    try {
      await api.post(`/admin/${endpoint}`, { round: 1 }); // Por ahora ronda 1 fija
      alert(`${label} procesada con éxito.`);
      fetchStatus();
    } catch (err) {
      alert('Error en el procesamiento: ' + (err.response?.data?.message || 'Fallo de red'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black">CARGANDO TERMINAL MAESTRA...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="bg-black/50 p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-red-500" size={32} />
          <h1 className="text-2xl font-black tracking-tighter">ADMIN <span className="text-red-500">COMMAND CENTER</span></h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:text-white transition-colors font-bold text-slate-400 uppercase text-xs">
          <ArrowLeft size={16} /> Salir del Panel
        </button>
      </nav>

      <main className="p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA 1: RANKING EN TIEMPO REAL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <Users className="text-blue-400" /> RANKING CORPORATIVO
              </h3>
              <button onClick={fetchStatus} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <table className="w-full text-left">
              <thead className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-700">
                <tr>
                  <th className="pb-4">EMPRESA</th>
                  <th className="pb-4">CASH NETO</th>
                  <th className="pb-4">ÉTICA</th>
                  <th className="pb-4">TECH</th>
                  <th className="pb-4">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-5 font-bold text-blue-400">{c.name}</td>
                    <td className="py-5 font-mono font-bold">$ {new Intl.NumberFormat('de-DE').format(c.cash)}</td>
                    <td className="py-5">{c.ethicsIndex}/100</td>
                    <td className="py-5">Lvl {c.techLevel}</td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${c.isBankrupt ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                        {c.isBankrupt ? 'BANCARROTA' : 'OPERATIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA 2: CONSOLA DE PROCESAMIENTO */}
        <div className="space-y-6">
          <div className="bg-red-950/20 rounded-3xl p-8 border border-red-900/30 shadow-2xl">
            <h3 className="text-xl font-black text-red-500 mb-8 flex items-center gap-3">
              <Play /> CONTROL DE FASES
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <AdminButton label="CERRAR ABASTECIMIENTO" onClick={() => runPhase('process-procurement', 'Abastecimiento')} disabled={processing} />
              <AdminButton label="CERRAR MANUFACTURA" onClick={() => runPhase('process-production', 'Manufactura')} disabled={processing} />
              <AdminButton label="CERRAR LOGÍSTICA" onClick={() => runPhase('process-logistics', 'Logística')} disabled={processing} />
              <AdminButton label="CERRAR MERCADO (VENTAS)" onClick={() => runPhase('process-sales', 'Ventas')} disabled={processing} variant="danger" />
            </div>

            <div className="mt-10 p-6 bg-black/40 rounded-2xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Reloj del Juego</p>
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">
                AVANZAR A SIGUIENTE RONDA
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center border-t border-slate-800/50 mt-10">
        <p className="text-slate-600 text-xs font-black tracking-[0.2em]">
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

const AdminButton = ({ label, onClick, disabled, variant = 'normal' }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 rounded-xl font-black text-xs tracking-widest transition-all active:scale-95 disabled:opacity-20 
      ${variant === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-black/20'} shadow-lg`}
  >
    {label}
  </button>
);

export default AdminPage;
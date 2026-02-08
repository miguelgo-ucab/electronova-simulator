// ============================================
// FILE: /client/src/pages/DashboardPage.jsx
// VERSION: 1.7.0
// DATE: 08-02-2026
// HOUR: 08:10
// PURPOSE: Dashboard con suscripción a sala de Socket.IO específica.
// CHANGE LOG: Implementación de socket.emit('join-game') para aislamiento de eventos.
// SPEC REF: Sección 3.5 - WebSockets
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket } from '../services/socket';
import { Wallet, ShieldCheck, Cpu, Package, TrendingUp, Save, Bell, Globe } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(amount || 0);
  };

  const fetchCompanyData = useCallback(async () => {
    try {
      const response = await api.get('/companies/my-company');
      const data = response.data.data.company;
      
      if (!data.gameId) { 
        navigate('/join-room'); 
        return; 
      }
      
      setCompany(data);

      // --- CAMBIO CRÍTICO: UNIRSE A LA SALA DE SOCKET ---
      if (data.gameId && data.gameId.gameCode) {
        console.log('[SOCKET] Uniéndose a sala:', data.gameId.gameCode);
        socket.emit('join-game', data.gameId.gameCode);
      }
      // --------------------------------------------------

    } catch (error) {
      console.error('Error de carga');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCompanyData();

    // Escuchar eventos solo de mi sala (El servidor ya filtra por mi gameCode)
    socket.on('roundProcessed', (data) => {
      setNotification(`¡RONDA ${data.round} FINALIZADA!`);
      fetchCompanyData(); // Recargar datos financieros
      setTimeout(() => setNotification(null), 6000);
    });

    socket.on('timeAdvance', (data) => {
      setNotification(`NUEVA RONDA: ${data.newRound}`);
      fetchCompanyData(); // Recargar quota
      setTimeout(() => setNotification(null), 6000);
    });

    return () => { 
      socket.off('roundProcessed');
      socket.off('timeAdvance');
    };
  }, [fetchCompanyData]);

  if (loading) return (
    <MainLayout className="bg-[#0F172A] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase">Conectando Satélite...</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout className="bg-[#F1F5F9]">
      {notification && (
        <div className="fixed top-24 right-8 z-[100] bg-[#0F172A] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <Bell size={20} className="text-blue-400" /> <span className="font-bold text-xs tracking-wide">{notification}</span>
        </div>
      )}

      <nav className="bg-[#0F172A] text-white px-8 py-5 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20"><TrendingUp size={20} /></div>
          <h1 className="text-lg font-black tracking-tighter uppercase">ElectroNova <span className="text-blue-400">OS</span></h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right border-r border-slate-700 pr-8 hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operador</p>
            <p className="text-xs font-bold text-white">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-red-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500">
            Salir
          </button>
        </div>
      </nav>

      <div className="p-8 lg:p-12 w-full max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-[10px] uppercase tracking-[0.2em] mb-3 bg-blue-100/50 w-fit px-3 py-1 rounded-full">
              <Globe size={12} /> Sala: {company?.gameId?.gameCode} • Ronda: {company?.gameId?.currentRound}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{company?.name}</h2>
          </div>
          <button 
            onClick={() => navigate('/decision')} 
            className="group bg-[#0F172A] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-slate-900/20 transition-all duration-300 flex items-center gap-3 active:scale-95 text-xs tracking-widest"
          >
            <Save size={18} className="text-blue-400 group-hover:text-white transition-colors" /> 
            ESTRATEGIA
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Wallet size={24} />} label="Capital Líquido" value={`$ ${formatMoney(company?.cash)}`} color="bg-emerald-500" />
          <StatCard icon={<ShieldCheck size={24} />} label="Índice de Ética" value={`${company?.ethicsIndex}/100`} color="bg-blue-500" />
          <StatCard icon={<Cpu size={24} />} label="Nivel Tech" value={`LVL ${company?.techLevel}`} color="bg-purple-600" />
          <StatCard icon={<Package size={24} />} label="Capacidad Planta" value={`${company?.productionQuota} u.`} color="bg-orange-500" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Activos en Almacén</h3>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">Online</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-white">
                  <th className="px-10 py-6">Categoría</th>
                  <th className="px-10 py-6">Producto</th>
                  <th className="px-10 py-6">Unidades</th>
                  <th className="px-10 py-6">Plaza</th>
                  <th className="px-10 py-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {company?.inventory?.map((lot, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{lot.type}</td>
                    <td className="px-10 py-6 text-slate-900 font-bold">{lot.itemRef}</td>
                    <td className="px-10 py-6 font-mono font-bold text-slate-700">{lot.units.toLocaleString()}</td>
                    <td className="px-10 py-6 text-slate-500 italic">{lot.location}</td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${lot.roundsUntilArrival === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {lot.roundsUntilArrival === 0 ? 'Disponible' : `En Tránsito (${lot.roundsUntilArrival})`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="p-10 text-center">
        <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase opacity-60">
          © Maribel Pinheiro & Miguel González | Ene-2026
        </p>
      </footer>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{value}</p>
  </div>
);

export default DashboardPage;
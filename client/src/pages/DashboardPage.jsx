// ============================================
// FILE: /client/src/pages/DashboardPage.jsx
// VERSION: 1.2.0
// DATE: 01-02-2026
// HOUR: 22:15
// PURPOSE: Dashboard con actualizacion automatica via WebSockets.
// CHANGE LOG: Integracion de socket.on('roundProcessed') para refresco de KPIs.
// SPEC REF: Seccion 3.5 (WebSockets) y 5.1 (Interfaz)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket } from '../services/socket'; // IMPORTANTE: El oido del sistema
import { 
  Wallet, ShieldCheck, Cpu, Package, LogOut, TrendingUp, Save, Bell 
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Funcion para cargar datos (Memorizada para evitar re-renderizados infinitos)
  const fetchCompanyData = useCallback(async () => {
    try {
      const response = await api.get('/companies/my-company');
      setCompany(response.data.data.company);
    } catch (error) {
      console.error('Error cargando datos financieros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Carga inicial de datos
    fetchCompanyData();

    // 2. CONFIGURACION DE ESCUCHA EN TIEMPO REAL
    socket.on('roundProcessed', (data) => {
      console.log('[SOCKET] Ronda procesada detectada:', data);
      
      // Mostrar alerta visual al estudiante
      setNotification(`¡Ronda ${data.round} finalizada! Los datos se han actualizado.`);
      
      // Refrescar los KPIs automaticamente
      fetchCompanyData();

      // Limpiar notificacion tras 5 segundos
      setTimeout(() => setNotification(null), 5000);
    });

    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => {
      socket.off('roundProcessed');
    };
  }, [fetchCompanyData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-mono uppercase">
      [SISTEMA] Sincronizando con el Mercado Central...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NOTIFICACION FLOTANTE DE TIEMPO REAL */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-electric-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <Bell className="animate-ring" />
            <span className="font-bold text-sm">{notification}</span>
          </div>
        </div>
      )}

      {/* Barra Superior */}
      <nav className="bg-[#0F172A] text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-electric-500" />
          <span className="font-bold text-xl tracking-tight">ElectroNova <span className="text-electric-500">OS</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium border-r border-slate-700 pr-6 uppercase font-mono">
            ID: {user?.email}
          </span>
          <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all font-bold text-sm">
            <LogOut size={18} /> SALIR
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-[#0F172A]">Panel de Gestión: <span className="text-blue-600">{company?.name}</span></h2>
            <p className="text-slate-500 font-medium">Estado de la corporación en tiempo real</p>
          </div>
          <button 
            onClick={() => navigate('/decision')} 
            className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 active:scale-95"
          >
            <Save size={20} /> INGRESAR ESTRATEGIA
          </button>
        </header>

        {/* Rejilla de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard icon={<Wallet className="text-green-500" />} label="Capital (Cash)" value={`$ ${new Intl.NumberFormat('de-DE').format(company?.cash)}`} color="border-l-green-500" />
          <KPICard icon={<ShieldCheck className="text-blue-500" />} label="Índice Ético" value={`${company?.ethicsIndex}/100`} color="border-l-blue-500" />
          <KPICard icon={<Cpu className="text-purple-500" />} label="Tecnología" value={`Nivel ${company?.techLevel}`} color="border-l-purple-500" />
          <KPICard icon={<Package className="text-orange-500" />} label="Almacén" value={`${company?.inventory?.length} Lotes`} color="border-l-orange-500" />
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-[#0F172A] flex items-center gap-3 tracking-tight">
              <Package size={24} className="text-slate-400" /> RESUMEN DE ACTIVOS FÍSICOS
            </h3>
            <span className="text-[10px] font-bold bg-slate-200 px-3 py-1 rounded-full text-slate-600 uppercase tracking-widest">Sincronizado</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5">Referencia</th>
                <th className="px-8 py-5">Unidades</th>
                <th className="px-8 py-5">Ubicación</th>
                <th className="px-8 py-5">Estado Logístico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {company?.inventory?.map((lot, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6 font-black text-xs text-slate-400">{lot.type}</td>
                  <td className="px-8 py-6 text-[#0F172A] font-bold">{lot.itemRef}</td>
                  <td className="px-8 py-6 font-mono font-bold text-lg">{lot.units.toLocaleString()}</td>
                  <td className="px-8 py-6 text-slate-600 font-medium italic">{lot.location}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tight ${lot.roundsUntilArrival === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {lot.roundsUntilArrival === 0 ? 'LISTO PARA OPERAR' : `EN TRÁNSITO (${lot.roundsUntilArrival} R)`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="p-10 text-center">
        <p className="text-slate-400 text-xs font-black tracking-[0.2em]">
          © MARIBEL PINHEIRO & MIGUEL GONZÁLEZ | ENE-2026
        </p>
      </footer>
    </div>
  );
};

const KPICard = ({ icon, label, value, color }) => (
  <div className={`bg-white p-8 rounded-[1.5rem] shadow-sm border border-slate-200 border-l-[6px] ${color} hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-5">
      <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-[#0F172A] font-mono tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);

export default DashboardPage;
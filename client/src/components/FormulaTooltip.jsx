// ============================================
// FILE: /client/src/components/FormulaTooltip.jsx
// VERSION: 1.3.0
// DATE: 06-02-2026
// HOUR: 08:50
// PURPOSE: Componente didáctico con blindaje de Z-Index.
// CHANGE LOG: Ajuste de posicionamiento para evitar clipping en tablas.
// SPEC REF: Manual de Estilo - Sección 8
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================

import React from 'react';
import { Info } from 'lucide-react';

const FormulaTooltip = ({ title, formula, tip }) => {
  return (
    <div className="relative inline-flex items-center ml-2 group">
      <div className="cursor-help p-1 hover:bg-blue-100 rounded-full transition-colors">
        <Info size={16} className="text-blue-600" />
      </div>

      {/* TOOLTIP FLOTANTE */}
      {/* Nota: 'bottom-full' lo pone arriba. 'z-50' asegura que flote sobre todo. 'w-72' ancho fijo. */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-[#0F172A] border border-slate-600 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left">
        <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">
          {title}
        </h4>
        <div className="bg-black/50 p-3 rounded-lg border border-slate-800 mb-3">
          <code className="text-white font-mono text-xs block leading-relaxed">
            {formula}
          </code>
        </div>
        <p className="text-slate-400 text-[10px] italic leading-tight">
          <span className="text-blue-500 font-bold">TIP:</span> {tip}
        </p>
        
        {/* Triángulo */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0F172A]"></div>
      </div>
    </div>
  );
};

export default FormulaTooltip;
// ============================================
// FILE: /client/src/components/FormulaTooltip.jsx
// VERSION: 1.1.0
// DATE: 03-02-2026
// HOUR: 12:25
// PURPOSE: Refuerzo de visibilidad y posicionamiento del Tooltip.
// CHANGE LOG: Uso de z-index superior y correccion de disparador hover.
// SPEC REF: Manual de Estilo - Seccion 8 (Formulas)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

import React from 'react';
import { Info } from 'lucide-react';

const FormulaTooltip = ({ title, formula, tip }) => {
  return (
    <div className="group relative inline-flex items-center ml-2">
      <div className="p-1 cursor-help hover:bg-blue-50 rounded-full transition-colors">
        <Info size={14} className="text-blue-500" />
      </div>
      
      {/* TARJETA DE FORMULA - GLASSMORPHISM */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-6 bg-[#0F172A] border border-slate-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] pointer-events-none">
        <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-800 pb-2">
          {title}
        </h4>
        <div className="my-4 text-white font-mono text-xs bg-black/50 p-4 rounded-2xl border border-slate-800 leading-relaxed">
          {formula}
        </div>
        <div className="text-slate-400 text-[10px] italic leading-relaxed">
          <span className="text-blue-500 font-black uppercase tracking-tighter mr-1">Nota:</span> {tip}
        </div>
        {/* TRIANGULO INDICADOR */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-[#0F172A]"></div>
      </div>
    </div>
  );
};

export default FormulaTooltip;
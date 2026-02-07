// ============================================
// FILE: /client/src/utils/formatters.js
// VERSION: 1.1.0
// DATE: 03-02-2026
// HOUR: 12:20
// PURPOSE: Formateador manual para garantizar rigor visual $ 1.000,00.
// CHANGE LOG: Implementacion de concatenacion manual para espacio exacto.
// SPEC REF: Manual de Estilo - Seccion 3 (Cuerpo y Datos)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

export const formatCurrency = (amount) => {
  const number = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  
  return `$ ${number}`; // Garantiza el espacio entre $ y el numero
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('de-DE').format(num || 0);
};
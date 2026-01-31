// ============================================
// FILE: /client/tailwind.config.js
// VERSION: 1.0.1
// DATE: 31-01-2026
// HOUR: 12:25
// PURPOSE: Configuracion de la identidad visual oficial (Corporate Tech).
// CHANGE LOG: Definicion de colores Primario (Navy) y Secundario (Blue).
// SPEC REF: Manual de Estilo - Seccion 2 (Paleta de Colores)
// RIGHTS: © Maribel Pinheiro & Miguel González | Ene-2026
// ============================================
//
//
//

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
        },
        electric: {
          500: '#3B82F6',
        },
        profit: '#10B981',
        risk: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
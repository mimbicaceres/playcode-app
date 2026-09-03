import React, { useState } from 'react';
import { MASCOT_IMAGES } from '../data/mockData';

export const ReportsAnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Últimos 30 días');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExport = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#0b1c30] tracking-tight">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm md:text-base text-[#434655] mt-1">
            Detailed breakdown of learning progress and performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-200 text-[#0b1c30] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm outline-none cursor-pointer"
          >
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Este Semestre</option>
            <option>Todo el año</option>
          </select>

          <button
            onClick={handleExport}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar PDF/CSV</span>
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          Reporte compilado con éxito. Se ha descargado el informe analítico de PlayCode.
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Reporte de Rendimiento por Curso (Bar Chart area) */}
        <div className="bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col col-span-1 md:col-span-8 min-h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-bold text-lg md:text-xl text-[#0b1c30]">
              Reporte de Rendimiento por Curso
            </h2>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>

          {/* Bar Chart Canvas */}
          <div className="flex-grow flex items-end justify-between gap-3 mt-auto relative pt-8 pb-4">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] text-slate-400 font-mono pointer-events-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-x-8 top-0 border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[25%] border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[50%] border-b border-slate-100" />
            <div className="absolute inset-x-8 top-[75%] border-b border-slate-100" />
            <div className="absolute inset-x-8 bottom-6 border-b border-slate-200" />

            {/* Bars container */}
            <div className="ml-10 w-full flex items-end justify-around gap-2 h-[220px]">
              {/* Bar 1 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[44px] bg-[#2563eb] rounded-t-lg h-[85%] group-hover:opacity-85 transition-all relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[11px] font-semibold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    85% Completado
                  </div>
                </div>
                <span className="text-xs text-[#434655] font-semibold mt-2 truncate w-full text-center">
                  HTML/CSS
                </span>
              </div>

              {/* Bar 2 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[44px] bg-[#6cf8bb] rounded-t-lg h-[60%] group-hover:opacity-85 transition-all relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[11px] font-semibold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    60% Completado
                  </div>
                </div>
                <span className="text-xs text-[#434655] font-semibold mt-2 truncate w-full text-center">
                  JavaScript
                </span>
              </div>

              {/* Bar 3 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[44px] bg-[#ffb95f] rounded-t-lg h-[40%] group-hover:opacity-85 transition-all relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[11px] font-semibold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    40% Completado
                  </div>
                </div>
                <span className="text-xs text-[#434655] font-semibold mt-2 truncate w-full text-center">
                  Python
                </span>
              </div>

              {/* Bar 4 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[44px] bg-[#d3e4fe] rounded-t-lg h-[15%] group-hover:opacity-85 transition-all relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[11px] font-semibold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    15% Completado
                  </div>
                </div>
                <span className="text-xs text-[#434655] font-semibold mt-2 truncate w-full text-center">
                  React
                </span>
              </div>

              {/* Bar 5 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[44px] bg-[#e5eeff] rounded-t-lg h-[8%] group-hover:opacity-85 transition-all relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[11px] font-semibold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    8% Completado
                  </div>
                </div>
                <span className="text-xs text-[#434655] font-semibold mt-2 truncate w-full text-center">
                  SQL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Errores Comunes (Donut Chart area) */}
        <div className="bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col col-span-1 md:col-span-4 min-h-[380px]">
          <h2 className="font-heading font-bold text-lg md:text-xl text-[#0b1c30] mb-4">
            Errores Comunes
          </h2>

          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Donut Chart with Conic Gradient */}
            <div 
              className="w-44 h-44 rounded-full shadow-inner relative flex items-center justify-center"
              style={{
                background: 'conic-gradient(#ba1a1a 0% 35%, #ffb95f 35% 65%, #6cf8bb 65% 85%, #d3e4fe 85% 100%)'
              }}
            >
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                <span className="font-heading font-extrabold text-2xl text-[#0b1c30]">142</span>
                <span className="text-[11px] font-semibold text-[#737686] text-center leading-tight">
                  Errores<br />Totales
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 w-full flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                  <span className="font-medium text-[#0b1c30]">Syntax Error</span>
                </div>
                <span className="font-bold text-[#434655]">35%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ffb95f]" />
                  <span className="font-medium text-[#0b1c30]">Logic Error</span>
                </div>
                <span className="font-bold text-[#434655]">30%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6cf8bb]" />
                  <span className="font-medium text-[#0b1c30]">Runtime Error</span>
                </div>
                <span className="font-bold text-[#434655]">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Tendencias de XP (Line Chart area) */}
        <div className="bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col col-span-1 md:col-span-12 min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-lg md:text-xl text-[#0b1c30]">
              Tendencias de XP
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00714d]" />
              <span className="text-xs font-semibold text-[#434655]">XP Obtenida Semanal</span>
            </div>
          </div>

          <div className="flex-grow w-full h-[200px] relative bg-[#eff4ff]/40 rounded-xl overflow-hidden border border-slate-100 flex items-end">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="xpGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6cf8bb" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6cf8bb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,100 L0,80 Q15,70 25,85 T50,55 T75,70 T90,25 T100,15 L100,100 Z" 
                fill="url(#xpGradient)" 
              />
              <path 
                d="M0,80 Q15,70 25,85 T50,55 T75,70 T90,25 T100,15" 
                fill="none" 
                stroke="#00714d" 
                strokeWidth="2.5" 
                vectorEffect="non-scaling-stroke" 
              />
              {/* Circular interactive points */}
              <circle cx="25" cy="85" r="2" fill="#ffffff" stroke="#00714d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="50" cy="55" r="2" fill="#ffffff" stroke="#00714d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="75" cy="70" r="2" fill="#ffffff" stroke="#00714d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="90" cy="25" r="2" fill="#ffffff" stroke="#00714d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="100" cy="15" r="2" fill="#ffffff" stroke="#00714d" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-xs font-semibold text-slate-500 z-10">
              <span>Semana 1</span>
              <span>Semana 2</span>
              <span>Semana 3</span>
              <span>Semana 4</span>
              <span className="text-[#00714d] font-bold">Actual (+650 XP)</span>
            </div>
          </div>
        </div>

        {/* Summary Stats Mini Cards */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003ea8] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">local_fire_department</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737686]">Racha Actual</p>
              <p className="font-heading font-bold text-xl text-[#0b1c30]">14 Días</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737686]">Ejercicios</p>
              <p className="font-heading font-bold text-xl text-[#0b1c30]">342</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737686]">Tiempo Total</p>
              <p className="font-heading font-bold text-xl text-[#0b1c30]">24h 15m</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">code</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737686]">Líneas Escritas</p>
              <p className="font-heading font-bold text-xl text-[#0b1c30]">8,405</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mascot Encouragement */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-30 flex items-end gap-2 animate-bounce" style={{ animationDuration: '4s' }}>
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl rounded-br-none p-3.5 max-w-[220px] text-xs text-[#0b1c30] leading-relaxed">
          ¡Excelente progreso! Estás mejorando mucho en JavaScript. ¡Sigue así!
        </div>
        <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-[#2563eb] overflow-hidden shadow-md flex-shrink-0">
          <img 
            src={MASCOT_IMAGES.closeup} 
            alt="Carpincho" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

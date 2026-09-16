import React, { useState } from 'react';
import { StatusHud } from './ui/StatusHud';

export const ReportsAnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExport = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const timeRanges = [
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' },
    { id: 'semester', label: 'Semestre' },
    { id: 'year', label: 'Año' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-6">
      
      {/* Top Status HUD in compact mode */}
      <StatusHud
        compact={true}
        avatarIcon="analytics"
        badgeText="Analítica & Métricas"
        title="Reportes & Rendimiento Académico"
        subtitle="Consolidado de avance curricular, diagnóstico de errores y horas de práctica"
      >
        {/* Time range pill selector */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === range.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">download</span>
          <span>Exportar PDF/CSV</span>
        </button>
      </StatusHud>

      {copiedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span>Informe analítico exportado y descargado exitosamente.</span>
        </div>
      )}

      {/* Summary KPI Cards Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <span className="material-symbols-outlined text-2xl">local_fire_department</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Racha Promedio</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">14.2 Días</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ejercicios Resueltos</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">1,342</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tiempo de Práctica</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">128h 45m</p>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <span className="material-symbols-outlined text-2xl">code</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Líneas de Código</p>
            <p className="font-sans font-bold text-xl text-[#0b1c30]">18,405</p>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout for Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Reporte de Rendimiento por Curso (Bar Chart area - 8 cols) */}
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-8 min-h-[360px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                Rendimiento por Curso
              </h2>
              <p className="text-xs text-slate-500">Porcentaje medio de finalización por materia</p>
            </div>
            <span className="font-mono text-xs text-slate-400">Total: 5 cursos</span>
          </div>

          {/* Bar Chart Canvas */}
          <div className="flex-grow flex items-end justify-between gap-3 relative pt-6 pb-2">
            {/* Y Axis Labels (Inter/Mono font for data precision) */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
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
            <div className="ml-10 w-full flex items-end justify-around gap-2 h-[200px]">
              {/* Bar 1 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[40px] bg-blue-600 rounded-t-lg h-[85%] group-hover:bg-blue-700 transition-all relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    85%
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                  HTML/CSS
                </span>
              </div>

              {/* Bar 2 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[40px] bg-emerald-500 rounded-t-lg h-[60%] group-hover:bg-emerald-600 transition-all relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    60%
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                  JavaScript
                </span>
              </div>

              {/* Bar 3 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[40px] bg-amber-500 rounded-t-lg h-[40%] group-hover:bg-amber-600 transition-all relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    40%
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                  Python
                </span>
              </div>

              {/* Bar 4 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[40px] bg-indigo-400 rounded-t-lg h-[25%] group-hover:bg-indigo-500 transition-all relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    25%
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                  React
                </span>
              </div>

              {/* Bar 5 */}
              <div className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div className="w-full max-w-[40px] bg-slate-400 rounded-t-lg h-[15%] group-hover:bg-slate-500 transition-all relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] font-bold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                    15%
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 truncate w-full text-center">
                  SQL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Errores Comunes (Donut Chart area - 4 cols) */}
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-4 min-h-[360px]">
          <h2 className="font-heading font-bold text-lg text-[#0b1c30] mb-1">
            Errores Comunes
          </h2>
          <p className="text-xs text-slate-500 mb-4">Tipología de fallos en ejecuciones</p>

          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Donut Chart with Conic Gradient */}
            <div 
              className="w-40 h-40 rounded-full shadow-inner relative flex items-center justify-center"
              style={{
                background: 'conic-gradient(#ef4444 0% 35%, #f59e0b 35% 65%, #10b981 65% 85%, #6366f1 85% 100%)'
              }}
            >
              <div className="w-26 h-26 bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="font-sans font-bold text-2xl text-[#0b1c30]">142</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>

            {/* Legend (Clean Inter/Mono metrics) */}
            <div className="mt-5 w-full flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-700 font-medium">Syntax Error</span>
                </div>
                <span className="font-mono font-bold text-slate-900">35%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700 font-medium">Logic Error</span>
                </div>
                <span className="font-mono font-bold text-slate-900">30%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Runtime Error</span>
                </div>
                <span className="font-mono font-bold text-slate-900">20%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-700 font-medium">Type / Formatting</span>
                </div>
                <span className="font-mono font-bold text-slate-900">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Tendencias de XP (Line Chart area - 12 cols) */}
        <div className="bg-white border border-[#e2e8f0] shadow-xs rounded-2xl p-5 md:p-6 flex flex-col col-span-1 md:col-span-12 min-h-[280px]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0b1c30]">
                Tendencias de XP & Actividad Semanal
              </h2>
              <p className="text-xs text-slate-500">Distribución de experiencia ganada a lo largo del periodo</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-slate-600">XP Obtenida</span>
            </div>
          </div>

          <div className="flex-grow w-full h-[180px] relative bg-slate-50/70 rounded-xl overflow-hidden border border-slate-100 flex items-end">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="xpGradientProfessional" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,100 L0,80 Q15,70 25,85 T50,55 T75,70 T90,25 T100,15 L100,100 Z" 
                fill="url(#xpGradientProfessional)" 
              />
              <path 
                d="M0,80 Q15,70 25,85 T50,55 T75,70 T90,25 T100,15" 
                fill="none" 
                stroke="#059669" 
                strokeWidth="2.5" 
                vectorEffect="non-scaling-stroke" 
              />
              <circle cx="25" cy="85" r="2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="50" cy="55" r="2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="75" cy="70" r="2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="90" cy="25" r="2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx="100" cy="15" r="2" fill="#ffffff" stroke="#059669" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-xs font-mono text-slate-500 z-10">
              <span>Semana 1</span>
              <span>Semana 2</span>
              <span>Semana 3</span>
              <span>Semana 4</span>
              <span className="text-emerald-700 font-bold">Semana Actual (+650 XP)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

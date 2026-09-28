import React from 'react';
import { ScreenView } from '../types';

interface WelcomeViewProps {
  onNavigate: (view: ScreenView) => void;
}

const WELCOME_SCENE = '/welcome-scene.png';

const FEATURES = [
  { id: 'aprende', title: 'Aprendé', detail: 'Contenidos paso a paso.', icon: 'menu_book', tile: 'bg-blue-100 text-blue-600' },
  { id: 'practica', title: 'Practicá', detail: 'Ejercicios y proyectos reales.', icon: 'code', tile: 'bg-violet-100 text-violet-600' },
  { id: 'crece', title: 'Crecé', detail: 'Desarrollá tus habilidades.', icon: 'bar_chart', tile: 'bg-emerald-100 text-emerald-600' },
];

// "PlayCode" wordmark: "Play" in navy, "Code" in blue.
const Wordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`font-heading font-bold tracking-tight ${className}`}>
    <span className="text-[#0b1433]">Play</span>
    <span className="text-[#2563eb]">Code</span>
  </span>
);

// "</>" logo mark.
const CodeMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`font-heading font-bold text-[#2563eb] tracking-tighter ${className}`}>&lt;/&gt;</span>
);

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onNavigate }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#f5f8fe] text-[#0b1433]">
    {/* Soft background shapes */}
    <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 1867 842" preserveAspectRatio="none" aria-hidden="true">
      <path d="M1120 0 C1140 110 1220 150 1220 260 C1220 360 1300 400 1420 380 C1600 350 1700 420 1867 400 V0 Z" fill="#dceafd" />
      <path d="M1560 0 C1580 80 1650 130 1760 140 C1810 145 1850 160 1867 170 V0 Z" fill="#c9e1fd" />
      <path d="M1867 560 C1780 600 1700 700 1640 842 H1867 Z" fill="#dcecfd" />
      <path d="M0 690 C120 700 260 740 380 842 H0 Z" fill="#d8eafd" />
    </svg>

    <div className="relative w-full max-w-[1500px] mx-auto px-6 lg:px-14 pt-6 pb-4 flex flex-col min-h-screen">
      {/* Hero: text · illustration · sign-in card */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_minmax(0,0.95fr)] items-center gap-8 lg:gap-4 py-4">
        {/* Text and features */}
        <section className="relative z-10 flex flex-col gap-6 lg:self-start">
          <h1 className="font-heading font-bold text-5xl xl:text-[66px] leading-[1.05] tracking-tight">
            Bienvenido a
            <br />
            <Wordmark />
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-[23rem]">
            Tu espacio para aprender a programar, practicar con proyectos y seguir creciendo a tu propio ritmo.
          </p>
          <ul className="flex flex-col gap-6 mt-2">
            {FEATURES.map((f) => (
              <li key={f.id} className="flex items-center gap-5">
                <span className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${f.tile}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 34 }}>{f.icon}</span>
                </span>
                <span>
                  <span className="block font-heading font-bold text-lg">{f.title}</span>
                  <span className="block text-sm text-slate-500">{f.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Illustration */}
        <div className="flex justify-center lg:w-[128%] lg:-ml-[28%]">
          <img
            src={WELCOME_SCENE}
            alt="Carpincho programando en su puff con libros, planta, café y un carpincho durmiendo"
            className="w-full max-w-[860px] max-h-[96vh] object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Sign-in card */}
        <section className="w-full max-w-md mx-auto bg-white rounded-3xl border border-blue-50 shadow-[0_24px_60px_rgba(37,99,235,0.12)] px-8 py-12 md:px-10 flex flex-col items-center text-center">
          <CodeMark className="text-6xl leading-none" />
          <Wordmark className="text-5xl mt-3" />
          <p className="mt-8 text-lg text-slate-600 leading-relaxed">
            Iniciá sesión para continuar
            <br />
            con tu aprendizaje.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full h-14 mt-8 bg-[#1f6feb] hover:bg-[#1a5fd0] text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(31,111,235,0.3)] transition-colors cursor-pointer"
          >
            <span>Iniciar sesión</span>
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </section>
      </main>
    </div>
  </div>
);

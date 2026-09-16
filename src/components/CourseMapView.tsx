import React from 'react';
import { ScreenView, Course } from '../types';
import { COURSES_DATA } from '../data/mockData';
import { StatusHud } from './ui/StatusHud';

interface CourseMapViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectCourse?: (course: Course) => void;
}

export const CourseMapView: React.FC<CourseMapViewProps> = ({ onNavigate, onSelectCourse }) => {
  const getLanguageStripeColor = (course: Course) => {
    const text = `${course.title} ${course.tag} ${course.category}`.toLowerCase();
    if (text.includes('python')) return '#ffb95f'; // Python warm orange-gold
    if (text.includes('javascript') || text.includes('js')) return '#eab308'; // JavaScript yellow
    if (text.includes('c++')) return '#3b82f6'; // C++ blue
    if (text.includes('css')) return '#0284c7'; // CSS cyan-blue
    if (text.includes('java')) return '#f97316'; // Java orange
    return course.color || '#2563eb';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Top Status HUD */}
      <StatusHud
        avatarIcon="explore"
        badgeText="Catálogo de Aprendizaje"
        title="Mapa de Cursos"
        subtitle="Explora las rutas de programación y continúa tu camino formativo"
      >
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Volver al Dashboard</span>
        </button>
      </StatusHud>

      {/* Courses Bento List */}
      <div className="grid grid-cols-1 gap-5">
        {COURSES_DATA.map((course) => {
          const isCompleted = course.progressPercent === 100;
          const isActive = course.progressPercent > 0 && course.progressPercent < 100;
          const stripeColor = getLanguageStripeColor(course);

          return (
            <article
              key={course.id}
              onClick={() => {
                if (onSelectCourse) onSelectCourse(course);
                onNavigate('course_roadmap');
              }}
              className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0px_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col"
            >
              {/* Top Language Colored Stripe */}
              <div 
                className="h-1.5 w-full shrink-0" 
                style={{ backgroundColor: stripeColor }}
              />

              <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                {/* Logo / Badge */}
                <div 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center p-2.5 shadow-xs"
                  style={{ backgroundColor: `${stripeColor}18`, border: `1px solid ${stripeColor}40` }}
                >
                  {course.logoUrl ? (
                    <img 
                      src={course.logoUrl} 
                      alt={course.title} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-3xl font-bold" style={{ color: stripeColor }}>
                      {course.iconName}
                    </span>
                  )}
                </div>

                {/* Course Info */}
                <div className="flex-grow w-full md:w-auto min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span 
                      className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                      style={{ backgroundColor: `${stripeColor}20`, color: '#0b1c30', border: `1px solid ${stripeColor}50` }}
                    >
                      {course.tag}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        En curso
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completado
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading font-bold text-xl text-[#0b1c30] mb-1">
                    {course.title}
                  </h2>
                  <p className="text-xs md:text-sm text-[#434655] line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${course.progressPercent}%`,
                          backgroundColor: isCompleted ? '#10B981' : stripeColor
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#737686] whitespace-nowrap">
                      {course.completedLessons}/{course.totalLessons} lecciones ({course.progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectCourse) onSelectCourse(course);
                    if (course.id === 'prog1') {
                      onNavigate('course_roadmap');
                    } else {
                      onNavigate('unit_detail');
                    }
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all flex-shrink-0 cursor-pointer shadow-xs ${
                    isActive 
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white' 
                      : isCompleted
                      ? 'bg-[#0b1c30] hover:bg-[#122e4e] text-white'
                      : 'bg-white hover:bg-slate-50 text-[#0b1c30] border border-slate-200'
                  }`}
                >
                  {isActive ? 'Continuar' : isCompleted ? 'Repasar' : 'Empezar'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
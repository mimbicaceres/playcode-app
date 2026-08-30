import React from 'react';
import { ScreenView, Course } from '../types';
import { COURSES_DATA } from '../data/mockData';

interface CourseMapViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectCourse?: (course: Course) => void;
}

export const CourseMapView: React.FC<CourseMapViewProps> = ({ onNavigate, onSelectCourse }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#0b1c30] tracking-tight">
          Mapa de Cursos
        </h1>
        <p className="text-base text-[#434655]">
          Explora las rutas de aprendizaje disponibles para tu nivel.
        </p>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 gap-5">
        {COURSES_DATA.map((course) => {
          const isCompleted = course.progressPercent === 100;
          const isActive = course.progressPercent > 0 && course.progressPercent < 100;

          return (
            <article
              key={course.id}
              onClick={() => {
                if (onSelectCourse) onSelectCourse(course);
                onNavigate('course_roadmap');
              }}
              className="bg-white rounded-2xl p-5 md:p-6 border shadow-[0px_4px_16px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: isActive ? '#16A34A' : '#E2E8F0',
                borderWidth: isActive ? '2px' : '1px'
              }}
            >
              {/* Logo / Badge */}
              <div 
                className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 shadow-sm"
                style={{ backgroundColor: `${course.color}15`, border: `1px solid ${course.color}30` }}
              >
                {course.logoUrl ? (
                  <img 
                    src={course.logoUrl} 
                    alt={course.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl" style={{ color: course.color }}>
                    {course.iconName}
                  </span>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-grow w-full md:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${course.color}15`, color: course.color }}
                  >
                    {course.tag}
                  </span>
                </div>

                <h2 className="font-heading font-bold text-xl text-[#0b1c30] mb-1">
                  {course.title}
                </h2>
                <p className="text-sm text-[#434655] line-clamp-1">
                  {course.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${course.progressPercent}%`,
                        backgroundColor: isCompleted ? '#10B981' : course.color
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#737686] whitespace-nowrap">
                    {course.completedLessons}/{course.totalLessons} lecciones
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
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 cursor-pointer shadow-sm ${
                  isActive 
                    ? 'bg-[#16A34A] hover:bg-[#15803d] text-white' 
                    : isCompleted
                    ? 'bg-[#1E3A8A] hover:bg-[#1e40af] text-white'
                    : 'bg-white hover:bg-slate-50 text-[#004ac6] border border-[#2563eb]'
                }`}
              >
                {isActive ? 'Continuar' : 'Repasar'}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

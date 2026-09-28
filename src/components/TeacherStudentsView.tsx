import React from 'react';
import { ScreenView, TeacherCourseRecord } from '../types';
import { StatusHud } from './ui/StatusHud';
import { CourseStudentList } from './CourseStudentList';

interface TeacherStudentsViewProps {
  // Selected course (chosen with "Ver curso"); null when none is selected.
  course: TeacherCourseRecord | null;
  onNavigate: (view: ScreenView) => void;
  // Opens the individual follow-up ("Progreso") of the chosen student.
  onViewProgress: (studentId: string) => void;
}

// Real teacher "Alumnos": only the students of the selected course (never mixed).
// The teacher only consults: students are not created or edited here.
export const TeacherStudentsView: React.FC<TeacherStudentsViewProps> = ({ course, onNavigate, onViewProgress }) => {
  const students = course?.students ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-6 pb-32 flex flex-col gap-5">

      <StatusHud
        compact={true}
        avatarIcon="groups"
        badgeText="Alumnos"
        title={course ? course.name : 'Alumnos'}
        subtitle={course ? `Curso: ${course.name} • ${course.category}` : 'Seleccioná un curso para ver sus alumnos'}
      >
        <button
          onClick={() => onNavigate('courses_map')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">swap_horiz</span>
          <span>{course ? 'Cambiar curso' : 'Ir a Cursos'}</span>
        </button>
      </StatusHud>

      {!course ? (
        <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs py-16 px-6 flex flex-col items-center text-center gap-2">
          <span className="material-symbols-outlined text-4xl text-slate-300">menu_book</span>
          <p className="text-sm font-semibold text-slate-600">Seleccioná un curso para ver sus alumnos.</p>
          <p className="text-[11px] text-slate-400">Entrá a Cursos y elegí "Ver curso".</p>
        </section>
      ) : (
        <>
          {/* Course summary */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alumnos</span>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-xl">groups</span>
                </span>
              </div>
              <span className="font-sans font-bold text-3xl text-[#0b1c30]">{students.length}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso promedio</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <span className="material-symbols-outlined text-xl">insights</span>
                </span>
              </div>
              <span className="font-sans font-bold text-3xl text-[#0b1c30]">{course.averageProgress}%</span>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${course.averageProgress}%` }} />
              </div>
            </div>
          </section>

          {/* Students of the selected course */}
          <CourseStudentList courseName={course.name} students={students} onViewProgress={onViewProgress} />
        </>
      )}
    </div>
  );
};

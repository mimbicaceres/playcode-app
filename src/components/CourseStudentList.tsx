import React from 'react';
import { StudentProgressRecord } from '../types';

interface CourseStudentListProps {
  // Name of the selected course (teacherCourseId) whose students are listed.
  courseName: string;
  // Students of that course only.
  students: StudentProgressRecord[];
  // Opens the individual follow-up ("Progreso") of the chosen student.
  onViewProgress: (studentId: string) => void;
}

// Compact list of the students of one course, used by the teacher's "Alumnos"
// view and by "Ver curso". Read-only: the teacher only consults.
export const CourseStudentList: React.FC<CourseStudentListProps> = ({ courseName, students, onViewProgress }) => (
    <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
      <div className="p-5 border-b border-[#e2e8f0] bg-slate-50/50">
        <h2 className="font-heading font-bold text-lg text-[#0b1c30]">Alumnos del curso</h2>
        <p className="text-xs text-slate-500">{courseName}</p>
      </div>

      {students.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">groups</span>
          <p className="text-sm font-semibold text-slate-600">Este curso todavía no tiene alumnos.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cuando haya alumnos asignados, vas a ver acá su avance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {students.map((student) => (
            <article key={student.id} className="rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-blue-300">person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#0b1c30] truncate">{student.name}</p>
                <p className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span>{student.overallProgress}% progreso</span>
                  <span>{student.exercisesSolved} ejercicios</span>
                  <span>{student.totalXp.toLocaleString('es-AR')} XP</span>
                  <span>{student.streakDays} días de racha</span>
                </p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${student.overallProgress}%` }} />
                </div>
              </div>
              <button
                onClick={() => onViewProgress(student.id)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Ver progreso
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
);

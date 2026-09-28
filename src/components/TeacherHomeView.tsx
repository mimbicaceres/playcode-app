import React from 'react';
import { ScreenView, TeacherCourseRecord, UserProfile } from '../types';
import { getTeacherStudents } from '../data/realTeacherData';
import { StatusHud } from './ui/StatusHud';

interface TeacherHomeViewProps {
  teacher: UserProfile;
  // Courses in charge of the teacher (empty until the backend has assignments).
  courses: TeacherCourseRecord[];
  onNavigate: (view: ScreenView) => void;
  // Opens a course. There is no course detail view yet, so it is optional and
  // the "Ver curso" button stays disabled until it exists.
  onViewCourse?: (courseId: string) => void;
}

// Courses shown in the summary; the rest are in "Cursos" ("Ver más").
const HOME_COURSES_LIMIT = 4;

const COURSE_STRIPES = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

// Real teacher home: a summary of the teacher's courses (the demo keeps TeacherDashboard).
// Courses are predefined by CODIX: the teacher only consults them (no content editing).
export const TeacherHomeView: React.FC<TeacherHomeViewProps> = ({ teacher, courses, onNavigate, onViewCourse }) => {
  const students = getTeacherStudents(courses);
  // Every enrollment counts (a student in two courses has progress and exercises in both),
  // the same way the teacher's general report aggregates them.
  const enrollments = courses.flatMap((c) => c.students);
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, s) => sum + s.overallProgress, 0) / enrollments.length)
    : 0;
  // The teacher only consults: exercises solved by the students of their courses.
  const exercisesSolved = enrollments.reduce((sum, s) => sum + s.exercisesSolved, 0);
  // No activity tracking in the backend yet.
  const recentActivity: { id: string; text: string; when: string }[] = [];

  // A student in two courses is counted once here (the course cards count them in each course).
  const inSeveralCourses = enrollments.length - students.length;
  const activeStudents = students.filter((s) => s.isActive).length;
  const studentsHint = [
    inSeveralCourses > 0 ? `${inSeveralCourses} ${inSeveralCourses === 1 ? 'cursa' : 'cursan'} más de un curso` : null,
    `${activeStudents} ${activeStudents === 1 ? 'activo' : 'activos'}`,
  ].filter(Boolean).join(' · ');

  const metrics: { label: string; value: string; icon: string; box: string; bar?: number; hint?: string }[] = [
    { label: 'Alumnos', value: `${students.length}`, icon: 'groups', box: 'bg-blue-50 text-blue-600', hint: studentsHint },
    { label: 'Cursos a cargo', value: `${courses.length}`, icon: 'menu_book', box: 'bg-violet-50 text-violet-600' },
    { label: 'Progreso promedio', value: `${averageProgress}%`, icon: 'insights', box: 'bg-emerald-50 text-emerald-600', bar: averageProgress },
    { label: 'Ejercicios resueltos', value: exercisesSolved.toLocaleString('es-AR'), icon: 'task_alt', box: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="flex-1 bg-[#f8f9ff]">
      <main className="p-4 md:p-8 pb-32">
        <div className="max-w-6xl mx-auto space-y-6">

          <StatusHud
            compact={true}
            avatarIcon="school"
            badgeText="Portal Docente"
            title={`${teacher.name} ${teacher.lastName}`}
            subtitle={teacher.school || 'Docente'}
          />

          {/* Teacher metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</span>
                  <span className={`p-2 rounded-lg ${metric.box}`}>
                    <span className="material-symbols-outlined text-xl">{metric.icon}</span>
                  </span>
                </div>
                <span className="font-sans font-bold text-3xl text-[#0b1c30]">{metric.value}</span>
                {metric.hint && <span className="text-[11px] text-slate-500 mt-1">{metric.hint}</span>}
                {metric.bar !== undefined && (
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${metric.bar}%` }} />
                  </div>
                )}
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* My courses (summary as cards) */}
            <section className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-heading font-bold text-lg text-[#0b1c30]">Mis cursos</h2>
                  <p className="text-xs text-slate-500">Resumen de los cursos a tu cargo</p>
                </div>
                {courses.length > HOME_COURSES_LIMIT && (
                  <button
                    onClick={() => onNavigate('courses_map')}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ver más</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                )}
              </div>

              {courses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs py-12 px-6 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">menu_book</span>
                  <p className="text-sm font-semibold text-slate-600">No tenés cursos asignados todavía.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cuando un administrador te asigne cursos, van a aparecer acá.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, HOME_COURSES_LIMIT).map((course, index) => (
                    <article key={course.id} className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0px_4px_16px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                      <div className="h-1.5 w-full" style={{ backgroundColor: COURSE_STRIPES[index % COURSE_STRIPES.length] }} />
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-heading font-bold text-lg text-[#0b1c30] truncate">{course.name}</h3>
                            <p className="text-xs text-slate-500">{course.category}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            course.status === 'Activo'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{course.status}</span>
                        </div>
                        <p className="text-sm text-slate-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-slate-400">groups</span>
                          {course.students.length} {course.students.length === 1 ? 'alumno' : 'alumnos'}
                        </p>
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>Progreso promedio</span>
                            <span className="text-[#0b1c30]">{course.averageProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.averageProgress}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1 mt-auto">
                          <button
                            onClick={() => onViewCourse?.(course.id)}
                            disabled={!onViewCourse}
                            title={onViewCourse ? undefined : 'Disponible próximamente'}
                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2563eb]"
                          >
                            Ver curso
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Recent activity of the teacher's students */}
            <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col">
              <div className="p-5 border-b border-[#e2e8f0] bg-slate-50/50">
                <h2 className="font-heading font-bold text-lg text-[#0b1c30]">Actividad Reciente</h2>
                <p className="text-xs text-slate-500">Lo último que hicieron tus alumnos</p>
              </div>
              {recentActivity.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">history</span>
                  <p className="text-sm font-semibold text-slate-600">No hay actividad reciente.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Acá vas a ver las entregas y avances de tus alumnos.</p>
                </div>
              ) : (
                <div className="p-3 divide-y divide-slate-100">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="py-3 px-2">
                      <p className="text-xs text-[#0b1c30]">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.when}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

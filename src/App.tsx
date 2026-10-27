import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ScreenView, UserProfile, Course, Unit, TeacherCourseRecord, ReportsData } from './types';
import { getDemoPerspective, getPathForView, getViewForPath, isDemoPath } from './routes';
import { canAccessView, getHomeView, isPublicView } from './auth/access';
import {
  ApiError, CourseProgressSummary, Gamification, ProgressByCourseResult, RegisterData, StudentStats, TeachingCourse, clearToken, fetchCourseContent, fetchInstituteReport, fetchMe, fetchMyCourses,
  fetchMyProgressByCourse, fetchStudentProgressByCourse, fetchTeaching, getStoredToken, loginRequest, registerRequest,
  storeToken, toUserProfile, updateMyAvatarRequest,
} from './auth/api';
import { BADGES, COURSES_DATA, DEMO_REPORTS, INITIAL_USER, MASCOT_IMAGES } from './data/mockData';
import { buildDemoInstitute, initialDemoInstituteState } from './data/demoInstitute';
import { catalogCoursesFor } from './data/codixCatalog';
import { splitCourseIds, toFrontendCourse } from './data/dynamicCourses';
import { buildTeacherCourses, buildTeacherCourseReport, buildTeacherOverallReport, EMPTY_REPORTS } from './data/realTeacherData';
import { buildStudentReports, toAchievementBadges } from './data/realStudentData';
import { Navigation } from './components/Navigation';
import { AccessDeniedView } from './components/AccessDeniedView';
import { AdminHomeView } from './components/AdminHomeView';
import { DemoAdminHomeView } from './components/DemoAdminHomeView';
import { AdminStudentProgressView } from './components/AdminStudentProgressView';
import { StudentProgressView } from './components/StudentProgressView';
import { EmptyState } from './components/ui/EmptyState';
import { WelcomeView } from './components/WelcomeView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { StudentDashboard } from './components/StudentDashboard';
import { CourseMapView } from './components/CourseMapView';
import { CourseRoadmapView } from './components/CourseRoadmapView';
import { UnitDetailView } from './components/UnitDetailView';
import { ExerciseCodingView } from './components/ExerciseCodingView';
import { CodeExerciseView } from './components/CodeExerciseView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { StudentProfileView } from './components/StudentProfileView';
import { TeacherProfileView } from './components/TeacherProfileView';
import { TeacherExerciseView } from './components/TeacherExerciseView';
import { TeacherHomeView } from './components/TeacherHomeView';
import { TeacherStudentsView } from './components/TeacherStudentsView';

// There is no achievements system in the backend yet: real users start with every badge locked.
const REAL_BADGES = BADGES.map((badge) => ({ ...badge, unlocked: false, unlockedAt: undefined }));

// Views that need at least one assigned course; without one the user sees an empty state.
const COURSE_VIEWS: ScreenView[] = ['dashboard', 'courses_map', 'course_roadmap', 'unit_detail', 'exercise'];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = getViewForPath(location.pathname);
  // Demo mode (/demo/...) renders the example data from mockData; normal URLs render real data.
  const isDemo = isDemoPath(location.pathname);
  // Demo only: which panel (student/teacher/admin) the admin is currently viewing.
  const demoPerspective = getDemoPerspective(location.pathname);
  // Authenticated user (from the backend JWT session), or null when logged out.
  const [user, setUser] = useState<UserProfile | null>(null);
  // Some views have role-specific paths (e.g. "Progreso": /docente/progreso vs /admin/progreso).
  const setCurrentView = (view: ScreenView) =>
    navigate(getPathForView(view, isDemo, isDemo ? demoPerspective : user?.role ?? 'student'));
  // Example student shown in demo mode. Never assigned to real accounts.
  const [demoUser, setDemoUser] = useState<UserProfile>(INITIAL_USER);
  // False while an existing token is being validated against /api/users/me.
  const [authChecked, setAuthChecked] = useState(() => !getStoredToken());
const [myCourseIds, setMyCourseIds] = useState<string[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex1');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Unidad elegida en la ruta del curso (solo cursos dinamicos reales).
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  // Contenido real (DB) de los cursos dinamicos asignados, resuelto a Course
  // por courseId. Nunca incluye los 5 cursos viejos (esos siguen por el
  // catalogo estatico).
  const [dynamicCourseContent, setDynamicCourseContent] = useState<Map<string, Course>>(new Map());
  // Progreso real propio (alumno) y de cada alumno a cargo (docente),
  // agrupado por curso dinamico. Alimenta la barra de progreso en reportes
  // y en el seguimiento individual del docente.
  const [myProgressByCourse, setMyProgressByCourse] = useState<CourseProgressSummary[]>([]);
  const [myWeeklyXp, setMyWeeklyXp] = useState<number[]>([]);
  const [studentProgressByCourse, setStudentProgressByCourse] = useState<Map<string, ProgressByCourseResult>>(new Map());
  // Estadisticas (precision, tiempo de practica, actividad) y gamificacion (nivel, logros) propias.
  const [myStats, setMyStats] = useState<{ overall: StudentStats; byCourse: Record<string, StudentStats> } | null>(null);
  const [myGamification, setMyGamification] = useState<Gamification | null>(null);
  const [studentWeeklyXp, setStudentWeeklyXp] = useState<Map<string, number[]>>(new Map());
  // Real teacher context: the course selected with "Ver curso" (Alumnos, Progreso
  // and Reporte refer to it) and the student opened with "Ver progreso".
  const [teacherCourseId, setTeacherCourseId] = useState<string | null>(null);
  const [progressStudentId, setProgressStudentId] = useState<string | null>(null);
  // Real teacher: assigned courses with their students (GET /api/users/me/teaching).
  const [teaching, setTeaching] = useState<TeachingCourse[]>([]);
  // Reporte general real del instituto (solo admin, se pide al abrir "Progreso").
  const [instituteReport, setInstituteReport] = useState<ReportsData | null>(null);
  // Demo institute: temporary changes made by the demo admin (reset on reload,
  // never sent to the backend) and every demo view derived from them.
  const [demoState, setDemoState] = useState(initialDemoInstituteState);
  const demo = useMemo(() => buildDemoInstitute(demoState), [demoState]);

  // Inicio is the teacher's general summary: going back to it clears the selected course
  // (real teacher and demo teacher panel alike).
  useEffect(() => {
    if (currentView === 'teacher_dashboard') {
      setTeacherCourseId(null);
      setProgressStudentId(null);
    }
    // Admin: the student opened from the users table only applies to that visit to Progreso.
    if (currentView === 'admin_dashboard') setProgressStudentId(null);
  }, [currentView]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchMe(token)
      .then(({ user: apiUser }) => setUser(toUserProfile(apiUser)))
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  // Vuelve a pedir los cursos asignados cada vez que el usuario navega (no
  // solo al iniciar sesion): si el admin asigna un curso nuevo mientras la
  // sesion ya esta abierta, se ve sin tener que cerrar sesion y reingresar.
  useEffect(() => {
    const token = getStoredToken();
    if (!token || !user) return;
    fetchMyCourses(token)
      .then(({ courseIds }) => setMyCourseIds(courseIds))
      .catch(() => {});
  }, [currentView, user?.id]);

  // El reporte del admin sale de la base y cambia con el tiempo: se vuelve a
  // pedir cada vez que se abre la vista de reportes.
  const isAdminSession = !isDemo && user?.role === 'admin';
  useEffect(() => {
    const token = getStoredToken();
    if (!isAdminSession || !token || currentView !== 'reports') return;
    fetchInstituteReport(token)
      .then(setInstituteReport)
      .catch(() => setInstituteReport(null));
  }, [isAdminSession, currentView, user?.id]);

  const isTeacherSession = !isDemo && user?.role === 'teacher';
  useEffect(() => {
    const token = getStoredToken();
    if (!isTeacherSession || !token) return;
    fetchTeaching(token)
      .then(({ courses }) => setTeaching(courses))
      .catch(() => setTeaching([]));
  }, [isTeacherSession, user?.id]);

  const isRealStudentSession = !isDemo && user?.role === 'student';
  // Ultimo curso al que entro el alumno (se recuerda en este navegador): el inicio
  // lo muestra como curso destacado con su progreso real.
  const lastCourseKey = user ? `codix_last_course:${user.id}` : null;
  const [lastOpenedCourseId, setLastOpenedCourseId] = useState<string | null>(null);
  useEffect(() => {
    if (!lastCourseKey) return;
    try { setLastOpenedCourseId(localStorage.getItem(lastCourseKey)); } catch { /* sin almacenamiento */ }
  }, [lastCourseKey]);
  useEffect(() => {
    if (!isRealStudentSession || !selectedCourse || !lastCourseKey) return;
    try { localStorage.setItem(lastCourseKey, selectedCourse.id); } catch { /* sin almacenamiento */ }
    setLastOpenedCourseId(selectedCourse.id);
  }, [selectedCourse?.id]);
  // Pide al backend el contenido real de los cursos dinamicos (los que no
  // estan en el catalogo estatico) asignados al alumno, o a cargo del
  // docente. Se puede volver a llamar (ej. tras completar un ejercicio) para
  // refrescar el status de avance.
  const refreshDynamicCourseContent = async () => {
    const token = getStoredToken();
    if (!token || (!isRealStudentSession && !isTeacherSession)) {
      setDynamicCourseContent(new Map());
      setMyProgressByCourse([]);
      return;
    }
    const relevantCourseIds = isRealStudentSession ? myCourseIds : teaching.map((t) => t.courseId);
    const { dynamicIds } = splitCourseIds(relevantCourseIds);
    if (dynamicIds.length === 0) {
      setDynamicCourseContent(new Map());
    } else {
      const courses = await Promise.all(
        dynamicIds.map((id) => fetchCourseContent(token, id).then(toFrontendCourse).catch(() => null)),
      );
      const map = new Map<string, Course>();
      for (const course of courses) if (course) map.set(course.id, course);
      setDynamicCourseContent(map);
    }

    if (isRealStudentSession) {
      fetchMyProgressByCourse(token)
        .then((result) => {
          setMyProgressByCourse(result.progress);
          setMyWeeklyXp(result.weeklyXp);
          setMyStats(result.stats);
          setMyGamification(result.gamification);
        })
        .catch(() => { setMyProgressByCourse([]); setMyWeeklyXp([]); setMyStats(null); setMyGamification(null); });
    }
  };

  // Progreso real de cada alumno a cargo del docente (para el seguimiento
  // individual y el promedio del curso), una vez que se sabe qué alumnos tiene.
  useEffect(() => {
    const token = getStoredToken();
    if (!token || !isTeacherSession) {
      setStudentProgressByCourse(new Map());
      setStudentWeeklyXp(new Map());
      return;
    }
    const studentIds = [...new Set(teaching.flatMap((t) => t.students.map((s) => s.id)))];
    if (studentIds.length === 0) {
      setStudentProgressByCourse(new Map());
      setStudentWeeklyXp(new Map());
      return;
    }
    Promise.all(
      studentIds.map((id) =>
        fetchStudentProgressByCourse(token, id)
          .then((result): [string, ProgressByCourseResult | null] => [id, result])
          .catch((): [string, ProgressByCourseResult | null] => [id, null]),
      ),
    ).then((entries) => {
      const ok = entries.filter((e): e is [string, ProgressByCourseResult] => e[1] !== null);
      setStudentProgressByCourse(new Map(ok));
      setStudentWeeklyXp(new Map(ok.map(([id, result]) => [id, result.weeklyXp])));
    });
  }, [isTeacherSession, teaching]);

  useEffect(() => {
    refreshDynamicCourseContent();
  }, [isRealStudentSession, isTeacherSession, myCourseIds, teaching]);

  // Changes made while in demo mode only touch the demo user.
  const updateViewUser = (update: (prev: UserProfile) => UserProfile) => {
    if (isDemo) setDemoUser(update);
    else setUser((prev) => prev && update(prev));
  };

  const handleAddXp = (amount: number) => {
    updateViewUser((prev) => ({
      ...prev,
      totalXp: prev.totalXp + amount
    }));
  };

  // Refresh user data after completing an exercise to sync XP, attempts, streak, etc.
  const handleExerciseCompleted = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const { user: apiUser } = await fetchMe(token);
      // Update global user state with fresh data from backend
      setUser(toUserProfile(apiUser));
      // Tambien el progreso, las estadisticas y la gamificacion (nivel, logros).
      const result = await fetchMyProgressByCourse(token);
      setMyProgressByCourse(result.progress);
      setMyWeeklyXp(result.weeklyXp);
      setMyStats(result.stats);
      setMyGamification(result.gamification);
    } catch (err) {
      console.error('Failed to refresh user after exercise:', err);
    }
  };

  // Lo unico que un alumno/docente puede cambiar de su propia cuenta es la
  // foto de perfil; nombre/apellido/escuela/año son de solo lectura (los
  // cambia el admin). En modo demo no hay backend, se guarda en el estado local.
  const handleUpdateAvatar = async (avatarDataUrl: string): Promise<string | null> => {
    if (isDemo) {
      updateViewUser((prev) => ({ ...prev, avatarUrl: avatarDataUrl }));
      return null;
    }
    const token = getStoredToken();
    if (!token) return 'Tu sesión expiró. Volvé a iniciar sesión.';
    try {
      const { user: apiUser } = await updateMyAvatarRequest(token, avatarDataUrl);
      setUser(toUserProfile(apiUser));
      return null;
    } catch (error) {
      return error instanceof ApiError && error.status === 400
        ? 'La imagen no es válida o es demasiado grande.'
        : 'No se pudo conectar con el servidor. Intentá de nuevo.';
    }
  };

  // Returns an error message to show in the form, or null on success.
  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      const { user: apiUser, token } = await loginRequest(email, password);
      storeToken(token);
      setUser(toUserProfile(apiUser));

      // Go back to the protected page that sent us to login, if this role may see it.
      const from = (location.state as { from?: string } | null)?.from;
      const target = from && canAccessView(getViewForPath(from), apiUser.role, isDemoPath(from))
        ? from
        : getPathForView(getHomeView(apiUser.role));
      navigate(target, { replace: true });
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return 'Email o contraseña incorrectos';
      }
      if (error instanceof ApiError && error.status === 403) {
        return 'Tu cuenta está desactivada. Consultá con el administrador de tu institución.';
      }
      return 'No se pudo conectar con el servidor. Intentá de nuevo.';
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setTeacherCourseId(null);
    setProgressStudentId(null);
    setTeaching([]);
    navigate(getPathForView('login'), { replace: true });
  };

  // Public sign-up always creates a student (enforced by the backend).
  // Returns an error message to show in the form, or null on success.
  const handleRegister = async (data: RegisterData): Promise<string | null> => {
    try {
      const { user: apiUser, token } = await registerRequest(data);
      storeToken(token);
      setUser(toUserProfile(apiUser));
      navigate(getPathForView(getHomeView(apiUser.role)), { replace: true });
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        return 'El email ya está registrado.';
      }
      if (error instanceof ApiError && error.status === 400) {
        return 'Revisá los datos ingresados e intentá de nuevo.';
      }
      return 'No se pudo conectar con el servidor. Intentá de nuevo.';
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-[#f8f9ff]" />;
  }

  // Route guard: protected views (and all of demo mode) require a session,
  // and the session's role must be allowed for the view in the current mode.
  if (!user && (isDemo || !isPublicView(currentView))) {
    return <Navigate to={getPathForView('login')} replace state={{ from: location.pathname }} />;
  }
  if (user && (currentView === 'welcome' || currentView === 'login' || currentView === 'register')) {
    return <Navigate to={getPathForView(getHomeView(user.role))} replace />;
  }
  if (user && isDemo && isPublicView(currentView)) {
    return <Navigate to={getPathForView(getHomeView(user.role), true)} replace />;
  }
  const isDenied = !!user && !canAccessView(currentView, user.role, isDemo);

  // Progreso general real del alumno: ejercicios completados sobre el total de sus cursos.
  const realGeneralProgress = (() => {
    const total = myProgressByCourse.reduce((sum, p) => sum + p.totalExercises, 0);
    const done = myProgressByCourse.reduce((sum, p) => sum + p.completedExercises, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  })();
  const viewUser = isDemo ? demoUser : user && user.role === 'student' ? { ...user, generalProgress: realGeneralProgress } : user;
  const isRealTeacher = !isDemo && user?.role === 'teacher';
  // Demo teacher panel (/demo/docente...): same teacher views, fed with the demo institute.
  const isDemoTeacher = isDemo && demoPerspective === 'teacher';
  const teacherMode = isRealTeacher || isDemoTeacher;
  const hasAssignedCourses = (viewUser?.assignedCourseIds.length ?? 0) > 0;
  // Students without courses get an empty state; teachers keep their views (with their own data).
  const showNoCourses = !isDenied && !teacherMode && COURSE_VIEWS.includes(currentView) && !hasAssignedCourses;
  const activeView: ScreenView | null = isDenied || showNoCourses ? null : currentView;
  // Course catalog shown in the course views: the example catalog in demo mode,
  // and for real users the CODIX static courses the admin assigned plus any
  // dynamic (DB-backed) course content already fetched.
  const visibleCourses = isDemo
    ? COURSES_DATA
    : [...catalogCoursesFor(user?.assignedCourseIds ?? []), ...dynamicCourseContent.values()];
  const isRealStudent = !isDemo && user?.role === 'student';
  // Curso real activo del alumno (si tiene contenido dinamico real cargado,
  // en vez del aviso de "actividades no disponibles").
  const activeStudentCourse = isRealStudent
    ? visibleCourses.find((c) => c.id === selectedCourse?.id) ?? visibleCourses[0] ?? null
    : null;
  const isDynamicCourseActive = !!activeStudentCourse && dynamicCourseContent.has(activeStudentCourse.id);
  // Se re-resuelve por id contra el curso recien refrescado (en vez de usar
  // directamente el objeto guardado en selectedUnit, que queda desactualizado
  // despues de completar un ejercicio y volver a pedir el contenido).
  const activeUnit = isDynamicCourseActive
    ? activeStudentCourse?.units.find((u) => u.id === selectedUnit?.id) ?? activeStudentCourse?.units[0] ?? null
    : null;
  const activeExercise = activeUnit
    ? activeUnit.exercises.find((e) => e.id === selectedExerciseId) ?? activeUnit.exercises[0] ?? null
    : null;

  // Suma, semana por semana, el XP de un grupo de alumnos (para los
  // reportes de docente: por curso o de todos sus cursos juntos).
  const sumWeeklyXp = (studentIds: string[]): number[] => {
    // Una suma por semana (5 semanas, la ultima es la actual).
    const totals = new Array(5).fill(0);
    for (const id of studentIds) {
      const xp = studentWeeklyXp.get(id);
      if (!xp) continue;
      xp.forEach((value, i) => { totals[i] += value; });
    }
    return totals;
  };

  const goHome = () => user && navigate(getPathForView(getHomeView(user.role)));
  const openDemo = () => user && navigate(getPathForView(getHomeView(user.role), true));
  // Courses (with their students) of the teacher: the real teacher's (assigned by an
  // admin) or, only in demo mode, the demo teacher's.
  const teacherCourses = isRealTeacher
    ? buildTeacherCourses(teaching, dynamicCourseContent, studentProgressByCourse)
    : isDemoTeacher ? demo.teacherCourses : [];
  const selectedTeacherCourse = teacherCourses.find((c) => c.id === teacherCourseId) ?? null;
  // Curso real dinamico que el docente esta viendo (si corresponde): le
  // permite hacer click en las unidades para leer las consignas, solo
  // lectura (nunca puede resolver ni enviar un ejercicio).
  const teacherDynamicCourse = isRealTeacher && selectedTeacherCourse && dynamicCourseContent.has(selectedTeacherCourse.course.id)
    ? selectedTeacherCourse.course
    : null;
  const teacherActiveUnit = teacherDynamicCourse
    ? teacherDynamicCourse.units.find((u) => u.id === selectedUnit?.id) ?? teacherDynamicCourse.units[0] ?? null
    : null;
  const teacherActiveExercise = teacherActiveUnit
    ? teacherActiveUnit.exercises.find((e) => e.id === selectedExerciseId) ?? teacherActiveUnit.exercises[0] ?? null
    : null;
  // Teacher "Ver curso": selects the course and opens the existing course view (read-only).
  const openTeacherCourse = (teacherCourse: TeacherCourseRecord) => {
    if (teacherCourse.id !== teacherCourseId) setProgressStudentId(null); // a student from another course does not carry over
    setTeacherCourseId(teacherCourse.id);
    setCurrentView('course_roadmap');
  };
  // Teacher "Ver progreso" (from "Ver curso" or "Alumnos"): opens Progreso with that
  // student; teacherCourseId is kept, so Progreso shows the same course's students.
  const openStudentProgress = (studentId: string) => {
    setProgressStudentId(studentId);
    setCurrentView('student_progress');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Navigation Bar */}
      {user && !isPublicView(currentView) && (
        <Navigation
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
          isDemo={isDemo}
          demoPerspective={demoPerspective}
          teacherCourseSelected={!!selectedTeacherCourse}
          onOpenDemo={openDemo}
          onExitDemo={goHome}
          onLogout={handleLogout}
        />
      )}

      {/* Demo mode banner */}
      {user && isDemo && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900">
          <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-600">slideshow</span>
              Modo demostración: estás viendo datos de ejemplo, no información real.
            </span>
            <button onClick={goHome} className="underline hover:no-underline cursor-pointer">
              Salir de la demo
            </button>
          </div>
        </div>
      )}

      {/* Screen Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'welcome' && (
          <WelcomeView onNavigate={setCurrentView} />
        )}

        {currentView === 'login' && (
          <LoginView onNavigate={setCurrentView} onLogin={handleLogin} />
        )}

        {currentView === 'register' && (
          <RegisterView onNavigate={setCurrentView} onRegister={handleRegister} />
        )}

        {isDenied && user && (
          <AccessDeniedView onGoHome={goHome} />
        )}

        {showNoCourses && (
          <div className="w-full max-w-3xl mx-auto px-4 py-10">
            <EmptyState
              imageSrc={MASCOT_IMAGES.mainHero}
              title="No tenés cursos asignados todavía"
              message="Cuando un administrador te asigne un curso, vas a poder comenzar a aprender."
            />
          </div>
        )}

        {activeView === 'dashboard' && viewUser && (
          <StudentDashboard
            user={viewUser}
            onNavigate={setCurrentView}
            courses={isRealStudent ? visibleCourses : undefined}
            onOpenCourse={(course) => {
              setSelectedCourse(course);
              setCurrentView('course_roadmap');
            }}
            gamification={isRealStudent ? myGamification : undefined}
            stats={isRealStudent ? myStats?.overall : undefined}
            lastCourseId={isRealStudent ? lastOpenedCourseId ?? myStats?.overall.recentActivity[0]?.courseId ?? null : undefined}
          />
        )}

        {activeView === 'courses_map' && (
          <CourseMapView
            courses={teacherMode ? teacherCourses.map((c) => c.course) : visibleCourses}
            onNavigate={setCurrentView}
            onSelectCourse={setSelectedCourse}
            backView={teacherMode ? 'teacher_dashboard' : isDemo || !user ? 'dashboard' : getHomeView(user.role)}
            mode={teacherMode ? 'teacher' : 'student'}
            onViewCourse={teacherMode
              ? (course) => {
                  const assigned = teacherCourses.find((c) => c.course === course)
                    ?? teacherCourses.find((c) => c.course.id === course.id);
                  if (assigned) openTeacherCourse(assigned);
                }
              : undefined}
          />
        )}

        {activeView === 'course_roadmap' && (
          teacherMode ? (
            <CourseRoadmapView
              onNavigate={setCurrentView}
              course={selectedTeacherCourse?.course ?? null}
              mode="teacher"
              teacherSummary={selectedTeacherCourse
                ? { studentsCount: selectedTeacherCourse.students.length, averageProgress: selectedTeacherCourse.averageProgress }
                : undefined}
              teacherStudents={selectedTeacherCourse?.students ?? []}
              onViewStudentProgress={openStudentProgress}
              onSelectUnit={teacherDynamicCourse ? setSelectedUnit : undefined}
            />
          ) : (
            <CourseRoadmapView
              onNavigate={setCurrentView}
              course={isRealStudent ? activeStudentCourse : selectedCourse}
              onSelectUnit={isRealStudent ? setSelectedUnit : undefined}
            />
          )
        )}

        {(activeView === 'unit_detail' || activeView === 'exercise') && isRealStudent && !isDynamicCourseActive && (
          <div className="w-full max-w-3xl mx-auto px-4 py-10">
            <EmptyState
              imageSrc={MASCOT_IMAGES.mainHero}
              title="Las actividades todavía no están disponibles"
              message="CODIX está preparando las actividades de este curso. Mientras tanto, podés revisar las unidades desde Cursos."
            />
          </div>
        )}

        {(activeView === 'unit_detail' || activeView === 'exercise') && teacherMode && !teacherDynamicCourse && (
          <div className="w-full max-w-3xl mx-auto px-4 py-10">
            <EmptyState
              imageSrc={MASCOT_IMAGES.mainHero}
              title="Seleccioná un curso para consultar sus actividades"
              message="Entrá a Cursos y elegí Ver curso para acceder a las unidades y consignas disponibles."
            />
          </div>
        )}

        {activeView === 'unit_detail' && !isRealStudent && !teacherMode && (
          <UnitDetailView
            onNavigate={setCurrentView}
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }}
          />
        )}

        {activeView === 'unit_detail' && teacherDynamicCourse && teacherActiveUnit && (
          <UnitDetailView
            onNavigate={setCurrentView}
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }}
            unit={teacherActiveUnit}
            course={teacherDynamicCourse}
            readOnly
          />
        )}

        {activeView === 'unit_detail' && isRealStudent && isDynamicCourseActive && activeStudentCourse && activeUnit && (
          <UnitDetailView
            onNavigate={setCurrentView}
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }}
            unit={activeUnit}
            course={activeStudentCourse}
          />
        )}

        {activeView === 'exercise' && !isRealStudent && !teacherMode && (
          <ExerciseCodingView
            onNavigate={setCurrentView}
            onAddXp={handleAddXp}
            currentExerciseId={selectedExerciseId}
            onExerciseCompleted={handleExerciseCompleted}
          />
        )}

        {activeView === 'exercise' && teacherDynamicCourse && teacherActiveUnit && teacherActiveExercise && (
          <TeacherExerciseView
            onNavigate={setCurrentView}
            course={teacherDynamicCourse}
            unit={teacherActiveUnit}
            exercise={teacherActiveExercise}
          />
        )}

        {activeView === 'exercise' && isRealStudent && isDynamicCourseActive && activeStudentCourse && activeUnit && activeExercise && (
          <CodeExerciseView
            onNavigate={setCurrentView}
            course={activeStudentCourse}
            unit={activeUnit}
            exercise={activeExercise}
            onExerciseCompleted={handleExerciseCompleted}
            onRefreshContent={refreshDynamicCourseContent}
          />
        )}

        {activeView === 'reports' && (
          isDemo && demoPerspective === 'admin' ? (
            // Demo institute: general report over all its active courses.
            <ReportsAnalyticsView data={demo.instituteReport} scope="general" />
          ) : isDemoTeacher ? (
            // Demo teacher: selected course only, or all their courses.
            selectedTeacherCourse ? (
              <ReportsAnalyticsView data={demo.courseReport(selectedTeacherCourse.id)} scope="course" courseName={selectedTeacherCourse.name} />
            ) : (
              <ReportsAnalyticsView data={demo.teacherReport} scope="teacher" />
            )
          ) : isDemo || !user ? (
            <ReportsAnalyticsView data={DEMO_REPORTS} />
          ) : user.role === 'admin' ? (
            // General report over the whole institute, calculated by the backend
            // (GET /api/reports/institute); empty until it loads or if it fails.
            <ReportsAnalyticsView data={instituteReport ?? EMPTY_REPORTS} scope="general" />
          ) : user.role === 'teacher' ? (
            // Selected course → report of that course only (per-unit, averaged
            // across its students); no course → all the teacher's courses.
            selectedTeacherCourse ? (
              <ReportsAnalyticsView
                data={buildTeacherCourseReport(selectedTeacherCourse, sumWeeklyXp(selectedTeacherCourse.students.map((s) => s.id)))}
                scope="course"
                courseName={selectedTeacherCourse.name}
              />
            ) : (
              <ReportsAnalyticsView
                data={buildTeacherOverallReport(teacherCourses, sumWeeklyXp([...new Set(teacherCourses.flatMap((c) => c.students.map((s) => s.id)))])) }
                scope="teacher"
              />
            )
          ) : (
            <ReportsAnalyticsView data={buildStudentReports(user, myProgressByCourse, myWeeklyXp, myStats?.overall)} />
          )
        )}

               {activeView === 'profile' && viewUser && !isRealTeacher && (
          <StudentProfileView
            user={viewUser}
            badges={isDemo ? BADGES : isRealStudent && myGamification ? toAchievementBadges(myGamification) : REAL_BADGES}
            gamification={isRealStudent ? myGamification : undefined}
            courses={isRealStudent ? visibleCourses : undefined}
            onOpenCourse={(course) => {
              setSelectedCourse(course);
              setCurrentView('course_roadmap');
            }}
            onUpdateAvatar={handleUpdateAvatar}
            onNavigate={setCurrentView}
          />
        )}

        {activeView === 'profile' && viewUser && isRealTeacher && (
          <TeacherProfileView
            user={viewUser}
            courses={teacherCourses}
            onUpdateAvatar={handleUpdateAvatar}
            onNavigate={setCurrentView}
          />
        )}

        {/* Teacher home: summary of the teacher's courses (real teacher, or the demo teacher). */}
        {activeView === 'teacher_dashboard' && teacherMode && user && (
          <TeacherHomeView
            teacher={isDemoTeacher ? demo.teacherUser : user}
            courses={teacherCourses}
            onNavigate={setCurrentView}
            onViewCourse={(courseId) => {
              const assigned = teacherCourses.find((c) => c.id === courseId);
              if (assigned) openTeacherCourse(assigned);
            }}
          />
        )}

        {/* Teacher "Alumnos": students of the selected course; "Ver progreso" opens their follow-up. */}
        {(activeView === 'teacher_student_detail' || (activeView as string) === 'student_detail') && teacherMode && (
          <TeacherStudentsView
            course={selectedTeacherCourse}
            onNavigate={setCurrentView}
            onViewProgress={openStudentProgress}
          />
        )}

        {/* "Progreso": individual follow-up of each student (teacher and admin). */}
        {activeView === 'student_progress' && (
          !teacherMode ? (
            isDemo ? (
              // Demo institute: all its students.
              <StudentProgressView students={demo.instituteStudents} initialStudentId={progressStudentId} />
            ) : (
              <AdminStudentProgressView initialStudentId={progressStudentId} />
            )
          ) : (
            // Only the students of the selected course; the view resets when the course changes.
            <StudentProgressView
              key={selectedTeacherCourse?.id ?? 'no-course'}
              students={selectedTeacherCourse?.students ?? []}
              initialStudentId={progressStudentId}
              emptyLabel={selectedTeacherCourse ? 'Este curso todavía no tiene alumnos' : 'Seleccioná un curso para ver a sus alumnos'}
            />
          )
        )}

        {/* Demo institute: same panel as the real /admin; its actions only change the demo state. */}
        {activeView === 'admin_dashboard' && isDemo && (
          <DemoAdminHomeView data={demo.admin} onChange={setDemoState} onViewStudentProgress={openStudentProgress} />
        )}

        {/* Real /admin: institute management with backend data. */}
        {activeView === 'admin_dashboard' && !isDemo && user && (
          <AdminHomeView currentUserId={user.id} onViewStudentProgress={openStudentProgress} />
        )}
      </main>
    </div>
  );
}

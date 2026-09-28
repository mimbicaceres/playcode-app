import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ScreenView, UserProfile, Course, TeacherCourseRecord } from './types';
import { getDemoPerspective, getPathForView, getViewForPath, isDemoPath } from './routes';
import { canAccessView, getHomeView, isPublicView } from './auth/access';
import {
  ApiError, RegisterData, TeachingCourse, clearToken, fetchMe, fetchTeaching, getStoredToken, loginRequest, registerRequest,
  storeToken, toUserProfile,
} from './auth/api';
import { BADGES, COURSES_DATA, DEMO_REPORTS, INITIAL_USER, MASCOT_IMAGES } from './data/mockData';
import { buildDemoInstitute, initialDemoInstituteState } from './data/demoInstitute';
import { catalogCoursesFor } from './data/codixCatalog';
import { buildTeacherCourses, EMPTY_REPORTS } from './data/realTeacherData';
import { buildStudentReports } from './data/realStudentData';
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
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { StudentProfileView } from './components/StudentProfileView';
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
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex1');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Real teacher context: the course selected with "Ver curso" (Alumnos, Progreso
  // and Reporte refer to it) and the student opened with "Ver progreso".
  const [teacherCourseId, setTeacherCourseId] = useState<string | null>(null);
  const [progressStudentId, setProgressStudentId] = useState<string | null>(null);
  // Real teacher: assigned courses with their students (GET /api/users/me/teaching).
  const [teaching, setTeaching] = useState<TeachingCourse[]>([]);
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

  const isTeacherSession = !isDemo && user?.role === 'teacher';
  useEffect(() => {
    const token = getStoredToken();
    if (!isTeacherSession || !token) return;
    fetchTeaching(token)
      .then(({ courses }) => setTeaching(courses))
      .catch(() => setTeaching([]));
  }, [isTeacherSession, user?.id]);

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

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    updateViewUser((prev) => ({
      ...prev,
      ...updatedData
    }));
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
  if (user && (currentView === 'login' || currentView === 'register')) {
    return <Navigate to={getPathForView(getHomeView(user.role))} replace />;
  }
  if (user && isDemo && isPublicView(currentView)) {
    return <Navigate to={getPathForView(getHomeView(user.role), true)} replace />;
  }
  const isDenied = !!user && !canAccessView(currentView, user.role, isDemo);

  const viewUser = isDemo ? demoUser : user;
  const isRealTeacher = !isDemo && user?.role === 'teacher';
  // Demo teacher panel (/demo/docente...): same teacher views, fed with the demo institute.
  const isDemoTeacher = isDemo && demoPerspective === 'teacher';
  const teacherMode = isRealTeacher || isDemoTeacher;
  const hasAssignedCourses = (viewUser?.assignedCourseIds.length ?? 0) > 0;
  // Students without courses get an empty state; teachers keep their views (with their own data).
  const showNoCourses = !isDenied && !teacherMode && COURSE_VIEWS.includes(currentView) && !hasAssignedCourses;
  const activeView: ScreenView | null = isDenied || showNoCourses ? null : currentView;
  // Course catalog shown in the course views: the example catalog in demo mode,
  // and the CODIX courses an admin assigned (without progress yet) for real users.
  const visibleCourses = isDemo ? COURSES_DATA : catalogCoursesFor(user?.assignedCourseIds ?? []);
  // Real students: units and activities have no progress tracking in the backend
  // yet, so these views show a notice instead of example content.
  const isRealStudent = !isDemo && user?.role === 'student';

  const goHome = () => user && navigate(getPathForView(getHomeView(user.role)));
  const openDemo = () => user && navigate(getPathForView(getHomeView(user.role), true));
  // Courses (with their students) of the teacher: the real teacher's (assigned by an
  // admin) or, only in demo mode, the demo teacher's.
  const teacherCourses = isRealTeacher ? buildTeacherCourses(teaching) : isDemoTeacher ? demo.teacherCourses : [];
  const selectedTeacherCourse = teacherCourses.find((c) => c.id === teacherCourseId) ?? null;
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
      {user && (
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
            />
          ) : (
            <CourseRoadmapView
              onNavigate={setCurrentView}
              course={isRealStudent
                ? visibleCourses.find((c) => c.id === selectedCourse?.id) ?? visibleCourses[0] ?? null
                : selectedCourse}
            />
          )
        )}

        {(activeView === 'unit_detail' || activeView === 'exercise') && isRealStudent && (
          <div className="w-full max-w-3xl mx-auto px-4 py-10">
            <EmptyState
              imageSrc={MASCOT_IMAGES.mainHero}
              title="Las actividades todavía no están disponibles"
              message="CODIX está preparando las actividades de este curso. Mientras tanto, podés revisar las unidades desde Cursos."
            />
          </div>
        )}

        {activeView === 'unit_detail' && !isRealStudent && (
          <UnitDetailView 
            onNavigate={setCurrentView} 
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }} 
          />
        )}

        {activeView === 'exercise' && !isRealStudent && (
          <ExerciseCodingView
            onNavigate={setCurrentView}
            onAddXp={handleAddXp}
            currentExerciseId={selectedExerciseId}
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
            // General report over the whole platform (no activity data in the backend yet).
            <ReportsAnalyticsView data={EMPTY_REPORTS} scope="general" />
          ) : user.role === 'teacher' ? (
            // Selected course → report of that course only; no course → all the teacher's courses.
            // (No activity data in the backend yet.)
            selectedTeacherCourse ? (
              <ReportsAnalyticsView data={EMPTY_REPORTS} scope="course" courseName={selectedTeacherCourse.name} />
            ) : (
              <ReportsAnalyticsView data={EMPTY_REPORTS} scope="teacher" />
            )
          ) : (
            <ReportsAnalyticsView data={buildStudentReports(user)} />
          )
        )}

        {activeView === 'profile' && viewUser && (
          <StudentProfileView
            user={viewUser}
            badges={isDemo ? BADGES : REAL_BADGES}
            onUpdateProfile={handleUpdateProfile}
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
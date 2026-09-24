import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ScreenView, UserProfile, UserRole, Course } from './types';
import { getPathForView, getViewForPath } from './routes';
import { canAccessView, getHomeView, isPublicView } from './auth/access';
import { ApiError, clearToken, fetchMe, getStoredToken, loginRequest, storeToken, toUserProfile } from './auth/api';
import { Navigation } from './components/Navigation';
import { AccessDeniedView } from './components/AccessDeniedView';
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
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDetailTeacherView } from './components/StudentDetailTeacherView';
import { AdminDashboardView } from './components/AdminDashboardView';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = getViewForPath(location.pathname);
  const setCurrentView = (view: ScreenView) => navigate(getPathForView(view));
  // Authenticated user (from the backend JWT session), or null when logged out.
  const [user, setUser] = useState<UserProfile | null>(null);
  // False while an existing token is being validated against /api/users/me.
  const [authChecked, setAuthChecked] = useState(() => !getStoredToken());
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex1');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchMe(token)
      .then(({ user: apiUser }) => setUser(toUserProfile(apiUser)))
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  const handleAddXp = (amount: number) => {
    setUser((prev) => prev && ({
      ...prev,
      totalXp: prev.totalXp + amount
    }));
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => prev && ({
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
      const target = from && canAccessView(getViewForPath(from), apiUser.role)
        ? from
        : getPathForView(getHomeView(apiUser.role));
      navigate(target, { replace: true });
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return 'Email o contraseña incorrectos';
      }
      return 'No se pudo conectar con el servidor. Intentá de nuevo.';
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate(getPathForView('login'), { replace: true });
  };

  const handleRegister = (data: { name: string; lastName: string; email: string; school: string; role: UserRole }) => {
    setUser((prev) => prev && ({
      ...prev,
      ...data,
      totalXp: 50,
      streakDays: 1
    }));

    if (data.role === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-[#f8f9ff]" />;
  }

  // Route guard: protected views require a session, and the session's role must be allowed.
  if (!user && !isPublicView(currentView)) {
    return <Navigate to={getPathForView('login')} replace state={{ from: location.pathname }} />;
  }
  if (user && (currentView === 'login' || currentView === 'register')) {
    return <Navigate to={getPathForView(getHomeView(user.role))} replace />;
  }
  const isDenied = !!user && !canAccessView(currentView, user.role);
  const activeView: ScreenView | null = isDenied ? null : currentView;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Navigation Bar */}
      {user && (
        <Navigation
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
          onLogout={handleLogout}
        />
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
          /* @ts-ignore */
          <RegisterView onNavigate={setCurrentView} onRegister={handleRegister} />
        )}

        {isDenied && user && (
          <AccessDeniedView onGoHome={() => setCurrentView(getHomeView(user.role))} />
        )}

        {activeView === 'dashboard' && user && (
          <StudentDashboard user={user} onNavigate={setCurrentView} />
        )}

        {activeView === 'courses_map' && (
          <CourseMapView onNavigate={setCurrentView} onSelectCourse={setSelectedCourse} />
        )}

        {activeView === 'course_roadmap' && (
          <CourseRoadmapView onNavigate={setCurrentView} course={selectedCourse} />
        )}

        {activeView === 'unit_detail' && (
          <UnitDetailView 
            onNavigate={setCurrentView} 
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }} 
          />
        )}

        {activeView === 'exercise' && (
          <ExerciseCodingView
            onNavigate={setCurrentView}
            onAddXp={handleAddXp}
            currentExerciseId={selectedExerciseId}
          />
        )}

        {activeView === 'reports' && (
          <ReportsAnalyticsView />
        )}

        {activeView === 'profile' && user && (
          <StudentProfileView
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setCurrentView}
          />
        )}

        {activeView === 'teacher_dashboard' && (
          <TeacherDashboard
            onNavigate={setCurrentView}
            onSelectStudentDetail={() => setCurrentView('student_detail' as ScreenView)}
          />
        )}

        {(activeView === 'teacher_student_detail' || (activeView as string) === 'student_detail') && (
          <StudentDetailTeacherView onNavigate={setCurrentView} />
        )}

        {activeView === 'admin_dashboard' && (
          <AdminDashboardView onNavigate={setCurrentView} />
        )}
      </main>
    </div>
  );
}
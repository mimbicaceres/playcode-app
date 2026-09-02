import React, { useState } from 'react';
import { ScreenView, UserProfile, UserRole } from './types';
import { INITIAL_USER } from './data/mockData';
import { Navigation } from './components/Navigation';
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
  const [currentView, setCurrentView] = useState<ScreenView>('dashboard');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex1');

  const handleAddXp = (amount: number) => {
    setUser((prev: UserProfile) => ({
      ...prev,
      totalXp: prev.totalXp + amount
    }));
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev: UserProfile) => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUser((prev: UserProfile) => ({
      ...prev,
      role: newRole
    }));

    if (newRole === 'student') {
      setCurrentView('dashboard');
    } else if (newRole === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else if (newRole === 'admin') {
      setCurrentView('admin_dashboard');
    }
  };

  const handleLogin = (email: string, role: UserRole) => {
    setUser((prev: UserProfile) => ({
      ...prev,
      email,
      role,
      name: role === 'teacher' ? 'Prof. Santiago' : role === 'admin' ? 'Administrador' : 'Facundo'
    }));

    if (role === 'teacher') {
      setCurrentView('teacher_dashboard');
    } else if (role === 'admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleRegister = (data: { name: string; lastName: string; email: string; school: string; role: UserRole }) => {
    setUser((prev: UserProfile) => ({
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

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Navigation Bar */}
      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onRoleChange={handleRoleChange}
      />

      {/* Screen Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'welcome' && (
          <WelcomeView onNavigate={setCurrentView} />
        )}

        {currentView === 'login' && (
          /* @ts-ignore */
          <LoginView onNavigate={setCurrentView} onLogin={handleLogin} />
        )}

        {currentView === 'register' && (
          /* @ts-ignore */
          <RegisterView onNavigate={setCurrentView} onRegister={handleRegister} />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard user={user} onNavigate={setCurrentView} />
        )}

        {currentView === 'courses_map' && (
          <CourseMapView onNavigate={setCurrentView} />
        )}

        {currentView === 'course_roadmap' && (
          <CourseRoadmapView onNavigate={setCurrentView} />
        )}

        {currentView === 'unit_detail' && (
          <UnitDetailView 
            onNavigate={setCurrentView} 
            onSelectExercise={(exId: string) => {
              setSelectedExerciseId(exId);
              setCurrentView('exercise');
            }} 
          />
        )}

        {currentView === 'exercise' && (
          <ExerciseCodingView
            onNavigate={setCurrentView}
            onAddXp={handleAddXp}
            currentExerciseId={selectedExerciseId}
          />
        )}

        {currentView === 'reports' && (
          <ReportsAnalyticsView />
        )}

        {currentView === 'profile' && (
          <StudentProfileView
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'teacher_dashboard' && (
          <TeacherDashboard
            onNavigate={setCurrentView}
            onSelectStudentDetail={() => setCurrentView('student_detail' as ScreenView)}
          />
        )}

        {(currentView as string) === 'student_detail' && (
          <StudentDetailTeacherView onNavigate={setCurrentView} />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboardView onNavigate={setCurrentView} />
        )}
      </main>
    </div>
  );
}
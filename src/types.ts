export type UserRole = 'student' | 'teacher' | 'admin';

export type ScreenView = 
  | 'welcome'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'courses_map'
  | 'course_roadmap'
  | 'unit_detail'
  | 'exercise'
  | 'reports'
  | 'profile'
  | 'teacher_dashboard'
  | 'teacher_student_detail'
  | 'admin_dashboard';

export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  school: string;
  grade?: string;
  avatarUrl: string;
  streakDays: number;
  totalXp: number;
  generalProgress: number;
}

export interface Exercise {
  id: string;
  unitId: string;
  title: string;
  description: string;
  instruction: string;
  initialCode: string;
  expectedVariable?: string;
  solutionRegex?: RegExp;
  hint: string;
  errorMessage: string;
  rewardXp: number;
  status: 'completed' | 'active' | 'locked';
  codeLanguage: string;
}

export interface Unit {
  id: string;
  courseId: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  progressPercent: number;
  status: 'completed' | 'active' | 'locked';
  exercises: Exercise[];
  mascotHint?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tag: string;
  color: string;
  accentBorder: string;
  iconName: string;
  logoUrl?: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  units: Unit[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  iconName: string;
  color: string;
  bgColor: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ActivityItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  action: string;
  highlightText: string;
  timeAgo: string;
  isError?: boolean;
}

export interface ExerciseHistoryItem {
  id: string;
  date: string;
  course: string;
  unit: string;
  status: 'correct' | 'incorrect';
  duration: string;
}

export interface InstitutionStats {
  schoolName: string;
  activeStudents: number;
  studentGrowth: string;
  completionRate: number;
  activeTeachers: number;
  totalTeachers: number;
}

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
  | 'student_progress'
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
  assignedCourseIds: string[];
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
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  prerequisiteId?: string;
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

export interface TeacherCourseSummary {
  id: string;
  name: string;
  students: number;
  progress: number;
  icon: string;
  category: string;
  status: 'Activo' | 'Pausado';
}

export interface TeacherDashboardData {
  teacherName: string;
  subtitle: string;
  totalStudents: number;
  studentsTrend?: string;
  activeGroups: number;
  averageProgress: number;
  submissionsToday: number;
  pendingFeedback: number;
  lastSubmission?: string;
  courses: TeacherCourseSummary[];
  activities: ActivityItem[];
}

export interface ReportsData {
  averageStreakDays: number;
  exercisesSolved: number;
  practiceTime: string;
  linesOfCode: number;
  coursePerformance: { label: string; percent: number; barClass: string }[];
  totalErrors: number;
  errorBreakdown: { label: string; percent: number; color: string; dotClass: string }[];
  xpTrend?: { weeklyXp: number[] };
  activeStudents?: number;
  averageProgress?: number;
  activitiesCount?: number;
  difficulties?: { topic: string; errors: number }[];
  studentsCount?: number;
}

export interface StudentAuditData {
  studentName: string | null;
  avatarUrl?: string;
  subtitle: string;
  overallProgress: number;
  exercisesSolved: number;
  exercisesTotal: number;
  platformTime: string;
  badges: AchievementBadge[];
  totalXp: number;
  weeklyXp: { xp: number; percent: number; barClass: string }[];
  accuracy: number;
  accuracyLabel?: string;
  accuracyNote: string;
  history: ExerciseHistoryItem[];
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school: string;
  status: 'Activo' | 'Pendiente';
  xp: number;
}

export interface AdminSchoolRow {
  id: string;
  name: string;
  province: string;
  plan: string;
  studentsCount: number;
  teachersCount: number;
  status: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  usersTrend?: string;
  coursesCount: number;
  coursesInEditing: number;
  sandboxUptime?: string;
  exercisesEvaluated: number;
  evaluationLatency?: string;
  users: AdminUserRow[];
  schools: AdminSchoolRow[];
  xpMultiplier: number;
  baseXp: number;
  streakBonusXp: number;
  clusters: { name: string; status: string; healthy: boolean }[];
  clusterFooter?: { scaling: string; latency: string };
  logs: { text: string; muted?: boolean }[];
}

export interface TeacherCourseRecord {
  id: string;
  name: string;
  category: string;
  status: 'Activo' | 'Pausado';
  averageProgress: number;
  students: StudentProgressRecord[];
  course: Course;
}

export interface StudentProgressRecord {
  id: string;
  name: string;
  avatarUrl?: string;
  grade?: string;
  school?: string;
  courseName?: string;
  isActive: boolean;
  lastActivity?: string;
  streakDays: number;
  bestStreakDays: number;
  totalXp: number;
  xpProgressPercent: number;
  badgesUnlocked: number;
  badgesTotal: number;
  overallProgress: number;
  exercisesSolved: number;
  exercisesTotal: number;
  accuracy: number;
  units: { label: string; percent: number }[];
  correctAnswers: number;
  incorrectAnswers: number;
  practiceThisWeek: string;
  practiceDailyAverage: string;
  practiceByDay: { day: string; minutes: number }[];
  attentionAreas: { title: string; detail: string; status: 'reinforce' | 'pending' }[];
  recentActivity: { when: string; exercise: string; correct: boolean }[];
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

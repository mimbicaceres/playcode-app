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
  // Courses an administrator assigned to this user. Empty for new accounts:
  // a student cannot start any course until one is assigned.
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

// Everything the teacher dashboard shows. Real teachers get it from their own
// data (all zeros until courses/students are assigned); demo mode uses mockData.
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

// Data for the "Progreso" (reports) view. Demo mode uses mockData; real
// teachers get zeros/empty lists until they have students with activity.
export interface ReportsData {
  averageStreakDays: number;
  exercisesSolved: number;
  practiceTime: string;
  linesOfCode: number;
  coursePerformance: { label: string; percent: number; barClass: string }[];
  totalErrors: number;
  errorBreakdown: { label: string; percent: number; color: string; dotClass: string }[];
  // XP obtained per week (oldest first, last = current week); absent when there is no activity.
  xpTrend?: { weeklyXp: number[] };
  // General (admin) report only: educational indicators and frequent difficulties.
  activeStudents?: number;
  averageProgress?: number;
  activitiesCount?: number;
  difficulties?: { topic: string; errors: number }[];
  // Students in the report (each counted once), to read "active students" against.
  studentsCount?: number;
}

// Data for the "Alumnos" (student audit) view. studentName is null when the
// teacher has no students assigned yet.
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

// Data for the admin panel. Demo mode uses mockData; the real /admin panel
// builds it from the backend (GET /api/users) and shows 0/empty for the rest.
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
  // Undefined when there is no monitoring data.
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

// Real /admin panel (institute management). Only users exist in the backend
// for now: courses, activities and progress stay empty/zero until their
// models exist. Optional fields render as "—" when missing.
// Courses, units and activities are predefined by CODIX: the admin only views
// them and assigns courses to teachers and students (no content editing).
export interface AdminInstituteUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  courseName?: string;
  assignedCourses?: number;
  progress?: number;
  lastActivity?: string;
  status: 'Activo' | 'Inactivo';
  // Details used by the admin actions (profile, edit, courses).
  firstName: string;
  lastName: string;
  school?: string;
  grade?: string;
  courseIds: string[];
  totalXp?: number;
  streakDays?: number;
  createdAt?: string;
}

export interface AdminInstituteCourseRow {
  id: string;
  name: string;
  teacherName?: string;
  studentsCount: number;
  unitsCount: number;
  activitiesCount: number;
  status: 'Activo' | 'Inactivo';
  // Content of the course (predefined by CODIX), shown by "Ver curso".
  units: { title: string; activities: number }[];
}

export interface AdminInstituteActivityRow {
  id: string;
  name: string;
  courseName: string;
  unitName: string;
  type: string;
  difficulty: string;
  status: 'Activo' | 'Inactivo';
}

export interface AdminInstituteData {
  studentsCount: number;
  teachersCount: number;
  activeCoursesCount: number;
  activitiesCount: number;
  users: AdminInstituteUserRow[];
  courses: AdminInstituteCourseRow[];
  activities: AdminInstituteActivityRow[];
  gamification: { xpMultiplier: number; baseXp: number; streakBonusXp: number };
}

// A course in charge of the real teacher, with its students. Feeds the real
// teacher views (Inicio, Cursos, Alumnos, Progreso, Reporte). Empty until the
// backend has courses and assignments.
export interface TeacherCourseRecord {
  id: string;
  name: string;
  category: string;
  status: 'Activo' | 'Pausado';
  averageProgress: number;
  students: StudentProgressRecord[];
  // Course content (units and activities) shown by the course view ("Ver curso").
  course: Course;
}

// Data for the "Progreso" view (individual follow-up of one student), used by
// teachers and admins. Demo mode uses mockData; real mode uses backend data.
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
  // Width of the XP bar (progress towards the next level).
  xpProgressPercent: number;
  badgesUnlocked: number;
  badgesTotal: number;
  assignedCourses?: any[];
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

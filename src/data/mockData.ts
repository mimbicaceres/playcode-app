import { Course, UserProfile, AchievementBadge, ActivityItem, ExerciseHistoryItem, InstitutionStats, TeacherDashboardData, ReportsData, StudentAuditData, AdminDashboardData, StudentProgressRecord } from '../types';

export const MASCOT_IMAGES = {
  mainHero: '/carpii.png',
  roundAvatar: '/carpii.png',
  pointing: '/carpii.png',
  thumbsUp: '/carpii.png',
  closeup: '/carpii.png',
  typingLaptop: '/carpii.png',
  cornerPeek: '/carpii.png',
  faceCorner: '/carpii.png',
};

export const LOGO_IMAGES = {
  htmlCss: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-HO-MPttTkq4srwC_BctgfwdhuAR1xVvAwE5I_KFLAiEWcriRY4LqepohdOvoEuf49JD3wK2Bv1ZLpwywUQt7FoZkTsQXqYBU73CxQXFWapTJlV0_fiUgtsnqBJUr_Tli5p9oxYl9ToFrPZ3y6K89qnQifOpewfyZX17EVLE9jjMulVl5uhAqNwKa-3EhFI7ZXxoRxqGawuU4KH-80F0fgdrglvh8dRhH0PXwJft5hev3X9gMuo4Dvw',
  python: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwx7qg_yE8HHgZ2AEZJ8fGgi4rdhXYvmQbmiHMNXl8JzqDlNIfHU3vooAQn_w0Tu2lu1k27hOTy19ZSbH17cYeTD7Ld9ExjQ7zyAB56wVKLUnLFj_cJBqmGhhvalOJWJIhS147KjIuXyiZEuEeZ9C-CgPaZJbmWG6TzTfz7fisgDhbuotfbbff0RpmfzGa6wXDfA-m8F9Jsx0ZL5UM4ERzfgj5ZZmun4-7AaHrJ9zPdAmKiXvJRVsReg',
  java: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgp8i5stFrUDtbdeO5Y2OMkZ6BYUHlW1xPWGSpCi7fG-k68pql4lv-YcPPlu2hm_nqHcNzkg7VlyMBOWlUG3BdmUwb_LZezmjPqaPX207Ynr1oh9JjrMMC6BFRqIL4tPiwGkaNbx50nxvew2xZP6dWZuqeHnKrM9ndAgDHcBZbOax0XSxLStJAAO-W0WliN5PIeMYTyYAtleZ6fQ76SoEfVwWZs5vpky_TmKYFT_UHQA1Owj_dlEoo4A'
};

export const AVATAR_IMAGES = {
  facuPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3WbPOwxYY017YuoyzvKEgc2kNS5px_E2WdHf77zraZjM9uMVjGkEqGSD9GPRWIDFi13Yco335AucE1zO-tLcoA5nzjKzlZoLXOfEVRtYdINB2TCuC_3QE_u8Ecc7eA1G6oBKPF2SG79nti5g8X6C5rtvSA_0XI9btvn8pJy4z-Nxq4upjeVrtPV4UCG-xCIKWjJncBe12ECqCzH3X_Cbre-SxoJrOqf03mZX3IBeSos_5MVmV4tQ',
  facuVector: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmkiI_kxgtuw6FPuZRkuXlUbxT1ArDyJw6tMbHTaLViBBIiHsFHBoqK-OcclBheA-i6asKP7X7t1EEtDrSVabbiUAjGX5XpY8WuoMTFmgpVa5pfSLZvzt3AMEBh5V_qJEWgI6gzFsRsjbj3BVemDDUHpa4E2D79D-YMaKcBukDZV4d9ofAb4B_nl3KgeI5X2x1ZjQ3U79uwsCMux2oc0TMj0lUGlwFbFxbW4KSwUVWS1_OufYUMBo',
  ana: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs8rbNa_n7b88LMoyoKHPFNl7HiIPsZlAue-sfJmPFzwqNWh_bTtmehg8ZdQTtT5l_KV65OM38LwHlfLdG5n8fDlP1YQVfuGpH8Sdo_vCGMB-wLIRoKQ3IkahW-XFyqmzusmVjvDklDP-mfXP30dvCQga9F0eqAKrZ1J15zLJY8zIKuHJz4pd-BlmvbaDvQzj8zTbKxd9WAY-j5bBA9P5GrLc7fWreNpjiIB4RU4QtCZhQQAxc0B0',
  luis: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFLfVwOUw5_eVZvgtkY2hC39p77BJLK2cdNXSVVnkq3ZCLINy6NyZOyAf8dFPUZ29VA-GYn7q4cbMXxMvF0dxIRZ_gvKw8xgzbYvVDZj2trlBc-BMpNzz14SRypNGjNwl8t8MU4jkqYIHuXlXVmZ6kDmiVQRBGYzasb6_EWW2MpqgWqseu5jms25MBWP63UoGmUFYTbFcT7Daya1VxyetTMCC-Wx9ME9oF3JYBRELOOxPipd30iY',
  maria: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOMLIsNQwzYtcXeXTTr1tahVTs2tYrjqMgPuBvUJpoEVmLNl2ZysqoaUbzO972IYcsGRUnBEGu_VzhF-iPTINFTiT6vhV72xozUe6GYADketcKX_ytozeKZU4TAVOwCZnm_84h3VHdzksUf0T6SvFN3wOQa1pKge-4vvQYqv8BluhW-D8QB3pY8iJVtqJn7T8eR6eqjIkU8112IB6AdpqzBLSXr8xLpau7IY22nEmKWtax_pfLP48',
  carlos: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCviQifZZAcTSSMsacR01mkrtQPHHidoYgAYzEM5NoB1qWCQ1pqYPA4ubn41mNz4wbAbbd5Acxfi98ETvo-RQheStFIB0i5Fxl_rs_jAOCduLf5s2kPGDT3akOSk1aDu_MudswktnUFDqj4QRxge66MC1L480GLYJdy8CsItnAqxKcSo5RmlQ5uFV5JXDpRTh3NMncNFTesj8QLmIp1hWPa4_TLj76nTct61Lds4OzPSUwXsryHTk'
};

export const currentUser: UserProfile = {
  id: 'user_facu_1',
  name: 'Facundo',
  lastName: 'G.',
  email: 'facu.g@colegio.edu.ar',
  role: 'student',
  school: 'Colegio San Martín',
  grade: '4to Año',
  avatarUrl: AVATAR_IMAGES.facuPhoto,
  streakDays: 12,
  totalXp: 2450,
  generalProgress: 78,
  assignedCourseIds: ['prog1']
};

export const INITIAL_USER = currentUser;

export const COURSES_DATA: Course[] = [
  {
    id: 'prog1',
    title: 'Programación 1: HTML & CSS',
    subtitle: 'Fundamentos y lógica de programación',
    description: 'Tu primer paso. Crea tu primera página web desde cero con estructura y estilo.',
    category: 'Web',
    tag: 'HTML5 & CSS3',
    color: '#1E3A8A',
    accentBorder: '#1E3A8A',
    iconName: 'html',
    logoUrl: LOGO_IMAGES.htmlCss,
    progressPercent: 100,
    completedLessons: 12,
    totalLessons: 12,
    status: 'in_progress',
    units: [
      {
        id: 'u1',
        courseId: 'prog1',
        number: 1,
        title: 'Unidad 1',
        subtitle: 'Introducción',
        description: 'Estructuras básicas, etiquetas de texto y cómo funciona la web.',
        progressPercent: 100,
        status: 'completed',
        exercises: []
      },
      {
        id: 'u2',
        courseId: 'prog1',
        number: 2,
        title: 'Unidad 2',
        subtitle: 'Variables & Lógica',
        description: 'Aprende a guardar información en la memoria de tu programa.',
        progressPercent: 50,
        status: 'active',
        mascotHint: '¡Estás a la mitad del camino! Las variables son clave, asegúrate de entender bien el ejercicio 3 antes de avanzar.',
        exercises: [
          {
            id: 'ex1',
            unitId: 'u2',
            title: 'Ejercicio 1: Tu primera variable',
            description: 'Declara una variable simple de texto.',
            instruction: 'Creá una variable llamada `nombre` y asignale tu nombre usando comillas.',
            initialCode: 'nombre = ',
            expectedVariable: 'nombre',
            hint: 'Escribe: nombre = "Facu" (recuerda usar comillas dobles o simples)',
            errorMessage: 'Revisa si pusiste las comillas en el nombre. Las cadenas de texto (strings) siempre necesitan comillas.',
            rewardXp: 15,
            status: 'completed',
            codeLanguage: 'python'
          },
          {
            id: 'ex2',
            unitId: 'u2',
            title: 'Ejercicio 2: Números',
            description: 'Trabaja con variables numéricas enteras.',
            instruction: 'Declara una variable llamada `edad` y asignale un número entero sin comillas.',
            initialCode: 'edad = ',
            expectedVariable: 'edad',
            hint: 'Escribe: edad = 16 (los números no llevan comillas)',
            errorMessage: 'Para guardar un número entero no debes usar comillas, solo el número.',
            rewardXp: 15,
            status: 'completed',
            codeLanguage: 'python'
          },
          {
            id: 'ex3',
            unitId: 'u2',
            title: 'Ejercicio 3: Cambiando valores',
            description: 'Aprende cómo actualizar el valor de una variable que ya ha sido declarada.',
            instruction: 'Creá una variable llamada `nombre` con comillas, y en la siguiente línea reasigna `puntos = 100`.',
            initialCode: 'nombre = "Facu"\npuntos = ',
            expectedVariable: 'puntos',
            hint: 'Completa la línea 2 con: puntos = 100',
            errorMessage: 'Revisa si asignaste el valor numérico 100 a la variable puntos.',
            rewardXp: 20,
            status: 'active',
            codeLanguage: 'python'
          },
          {
            id: 'ex4',
            unitId: 'u2',
            title: 'Ejercicio 4: Booleanos',
            description: 'Verdadero o falso: el tipo de dato más simple.',
            instruction: 'Declara una variable llamada `activo = True` para habilitar el usuario.',
            initialCode: 'activo = ',
            expectedVariable: 'activo',
            hint: 'Escribe: activo = True (con mayúscula inicial)',
            errorMessage: 'En Python los booleanos comienzan con mayúscula: True o False.',
            rewardXp: 25,
            status: 'locked',
            codeLanguage: 'python'
          }
        ]
      },
      {
        id: 'u3',
        courseId: 'prog1',
        number: 3,
        title: 'Unidad 3',
        subtitle: 'Condicionales',
        description: 'Toma de decisiones lógicas en tu código con if / else.',
        progressPercent: 0,
        status: 'locked',
        exercises: []
      },
      {
        id: 'u4',
        courseId: 'prog1',
        number: 4,
        title: 'Unidad 4',
        subtitle: 'Bucles',
        description: 'Repetición controlada de instrucciones con bucles for y while.',
        progressPercent: 0,
        status: 'locked',
        exercises: []
      }
    ]
  },
  {
    id: 'py2',
    title: 'Python Básico 2',
    subtitle: 'Análisis de datos y algoritmos',
    description: 'Aprende a analizar datos con Python. Listas, diccionarios y bibliotecas esenciales.',
    category: 'Data',
    tag: 'Python 3',
    color: '#16A34A',
    accentBorder: '#16A34A',
    iconName: 'code',
    logoUrl: LOGO_IMAGES.python,
    progressPercent: 45,
    completedLessons: 4,
    totalLessons: 10,
    status: 'available',
    prerequisiteId: 'prog1',
    units: []
  },
  {
    id: 'java3',
    title: 'Java Básico 3',
    subtitle: 'Programación orientada a objetos',
    description: 'Domina los conceptos básicos del lenguaje más popular de la web y el backend empresarial.',
    category: 'Backend',
    tag: 'Java & OOP',
    color: '#D97706',
    accentBorder: '#D97706',
    iconName: 'coffee',
    logoUrl: LOGO_IMAGES.java,
    progressPercent: 0,
    completedLessons: 0,
    totalLessons: 15,
    status: 'locked',
    prerequisiteId: 'py2',
    units: []
  },
  {
    id: 'js_base',
    title: 'Fundamentos de JavaScript',
    subtitle: 'Frontend Interactivo',
    description: 'Variables, ciclos, funciones y tu primer script en el navegador.',
    category: 'Frontend',
    tag: 'JavaScript ES6',
    color: '#EAB308',
    accentBorder: '#EAB308',
    iconName: 'javascript',
    progressPercent: 0,
    completedLessons: 0,
    totalLessons: 20,
    status: 'locked',
    prerequisiteId: 'java3',
    units: []
  },
  {
    id: 'css_modern',
    title: 'Diseño Web con CSS',
    subtitle: 'Estilos y Responsive Design',
    description: 'Colores, layouts modernos, Flexbox y CSS Grid.',
    category: 'Design',
    tag: 'CSS3 & Flexbox',
    color: '#0284C7',
    accentBorder: '#0284C7',
    iconName: 'css',
    progressPercent: 0,
    completedLessons: 0,
    totalLessons: 20,
    status: 'locked',
    prerequisiteId: 'js_base',
    units: []
  }
];

export const BADGES: AchievementBadge[] = [
  {
    id: 'b1',
    title: 'Mago del HTML',
    iconName: 'code_blocks',
    color: '#2563eb',
    bgColor: '#dbe1ff',
    unlocked: true,
    unlockedAt: 'Ayer'
  },
  {
    id: 'b2',
    title: 'Racha 7 Días',
    iconName: 'local_fire_department',
    color: '#d97706',
    bgColor: '#ffedd5',
    unlocked: true,
    unlockedAt: 'Hace 3 días'
  },
  {
    id: 'b3',
    title: 'Cazador de Bugs',
    iconName: 'bug_report',
    color: '#00714d',
    bgColor: '#dcfce7',
    unlocked: true,
    unlockedAt: 'La semana pasada'
  },
  {
    id: 'b4',
    title: 'CSS Guru',
    iconName: 'lock',
    color: '#737686',
    bgColor: '#eff4ff',
    unlocked: false
  }
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act1',
    studentName: 'Ana García',
    studentAvatar: AVATAR_IMAGES.ana,
    action: 'completó el ejercicio',
    highlightText: 'Bucles For',
    timeAgo: 'Hace 10 min'
  },
  {
    id: 'act2',
    studentName: 'Luis Pérez',
    studentAvatar: AVATAR_IMAGES.luis,
    action: 'solicitó ayuda en',
    highlightText: 'Variables Globales',
    timeAgo: 'Hace 45 min',
    isError: true
  },
  {
    id: 'act3',
    studentName: 'María Gómez',
    studentAvatar: AVATAR_IMAGES.maria,
    action: 'obtuvo una nueva medalla:',
    highlightText: 'Cazador de Bugs',
    timeAgo: 'Hace 2 horas'
  },
  {
    id: 'act4',
    studentName: 'Carlos Ruiz',
    studentAvatar: AVATAR_IMAGES.carlos,
    action: 'completó el módulo',
    highlightText: 'CSS Grid',
    timeAgo: 'Ayer'
  }
];

export const EXERCISE_HISTORY: ExerciseHistoryItem[] = [
  {
    id: 'h1',
    date: 'Hoy, 10:30',
    course: 'Intro a HTML',
    unit: 'Estructura Básica',
    status: 'correct',
    duration: '2m 45s'
  },
  {
    id: 'h2',
    date: 'Ayer, 15:45',
    course: 'Intro a HTML',
    unit: 'Etiquetas de Texto',
    status: 'correct',
    duration: '4m 12s'
  },
  {
    id: 'h3',
    date: 'Ayer, 15:30',
    course: 'Intro a HTML',
    unit: 'Etiquetas de Texto',
    status: 'incorrect',
    duration: '5m 30s'
  },
  {
    id: 'h4',
    date: '12 Oct, 09:15',
    course: 'Lógica Básica',
    unit: 'Variables',
    status: 'correct',
    duration: '1m 15s'
  }
];

export const INSTITUTION_STATS: InstitutionStats = {
  schoolName: 'Colegio San José',
  activeStudents: 452,
  studentGrowth: '+12% este mes',
  completionRate: 68,
  activeTeachers: 24,
  totalTeachers: 25
};

export const RECENT_USERS_ADMIN = [
  {
    id: 'u_lucia',
    name: 'Lucía Méndez',
    email: 'lucia.m@edu.ar',
    role: 'Estudiante',
    initials: 'LM',
    colorBg: 'bg-blue-100 text-blue-700',
    currentCourse: 'Intro a Python'
  },
  {
    id: 'u_juan',
    name: 'Juan Pérez',
    email: 'juan.perez@edu.ar',
    role: 'Docente',
    initials: 'JP',
    colorBg: 'bg-emerald-100 text-emerald-700',
    currentCourse: 'Fundamentos Web'
  },
  {
    id: 'u_sofia',
    name: 'Sofía García',
    email: 'sofia.g@edu.ar',
    role: 'Estudiante',
    initials: 'SG',
    colorBg: 'bg-amber-100 text-amber-700',
    currentCourse: 'Lógica Computacional'
  }
];

// Example teacher dashboard (demo mode only). Same values the dashboard used to hardcode.
export const DEMO_TEACHER_DASHBOARD: TeacherDashboardData = {
  teacherName: 'Prof. Santiago Ramos',
  subtitle: 'Colegio San Martín • Dpto. Ciencias de la Computación',
  totalStudents: 142,
  studentsTrend: '+12%',
  activeGroups: 4,
  averageProgress: 68,
  submissionsToday: 34,
  pendingFeedback: 2,
  lastSubmission: 'hace 12 min',
  courses: [
    { id: 'c1', name: 'Introducción a HTML/CSS', students: 45, progress: 82, icon: 'html', category: 'Frontend', status: 'Activo' },
    { id: 'c2', name: 'Lógica con JavaScript', students: 38, progress: 45, icon: 'javascript', category: 'Lógica', status: 'Activo' },
    { id: 'c3', name: 'Estructuras de Datos', students: 59, progress: 60, icon: 'data_object', category: 'Algoritmos', status: 'Activo' },
    { id: 'c4', name: 'Bases de Datos SQL', students: 24, progress: 15, icon: 'database', category: 'Backend', status: 'Pausado' }
  ],
  activities: RECENT_ACTIVITIES
};

// Example "Progreso" (reports) data (demo mode only). Same values the view used to hardcode.
export const DEMO_REPORTS: ReportsData = {
  averageStreakDays: 14.2,
  exercisesSolved: 1342,
  practiceTime: '128h 45m',
  linesOfCode: 18405,
  coursePerformance: [
    { label: 'HTML/CSS', percent: 85, barClass: 'bg-blue-600 group-hover:bg-blue-700' },
    { label: 'JavaScript', percent: 60, barClass: 'bg-emerald-500 group-hover:bg-emerald-600' },
    { label: 'Python', percent: 40, barClass: 'bg-amber-500 group-hover:bg-amber-600' },
    { label: 'React', percent: 25, barClass: 'bg-indigo-400 group-hover:bg-indigo-500' },
    { label: 'SQL', percent: 15, barClass: 'bg-slate-400 group-hover:bg-slate-500' }
  ],
  totalErrors: 142,
  errorBreakdown: [
    { label: 'Syntax Error', percent: 35, color: '#ef4444', dotClass: 'bg-red-500' },
    { label: 'Logic Error', percent: 30, color: '#f59e0b', dotClass: 'bg-amber-500' },
    { label: 'Runtime Error', percent: 20, color: '#10b981', dotClass: 'bg-emerald-500' },
    { label: 'Type / Formatting', percent: 15, color: '#6366f1', dotClass: 'bg-indigo-500' }
  ],
  xpTrend: { weeklyXp: [240, 190, 380, 310, 650] }
};

// Example student audit (demo mode only). Same values the view used to hardcode.
export const DEMO_STUDENT_AUDIT: StudentAuditData = {
  studentName: 'Facundo G.',
  avatarUrl: AVATAR_IMAGES.facuPhoto,
  subtitle: "Colegio San Martín • 4to Año 'A' • Registro Académico: #EST-8492",
  overallProgress: 78,
  exercisesSolved: 28,
  exercisesTotal: 36,
  platformTime: '14h 20m',
  badges: BADGES,
  totalXp: 2450,
  weeklyXp: [
    { xp: 120, percent: 25, barClass: 'bg-blue-200 hover:bg-blue-300' },
    { xp: 250, percent: 40, barClass: 'bg-blue-300 hover:bg-blue-400' },
    { xp: 210, percent: 35, barClass: 'bg-blue-300 hover:bg-blue-400' },
    { xp: 450, percent: 65, barClass: 'bg-blue-400 hover:bg-blue-500' },
    { xp: 620, percent: 88, barClass: 'bg-blue-600' }
  ],
  accuracy: 85,
  accuracyLabel: 'Alta',
  accuracyNote: '1 error registrado en 4 entregas',
  history: EXERCISE_HISTORY
};

// Example admin panel (demo mode only). Same values the view used to hardcode.
export const DEMO_ADMIN_DASHBOARD: AdminDashboardData = {
  totalUsers: 1240,
  usersTrend: '+18% mes',
  coursesCount: 48,
  coursesInEditing: 12,
  sandboxUptime: '99.98%',
  exercisesEvaluated: 18450,
  evaluationLatency: '120ms avg',
  users: [
    { id: 'u1', name: 'Facundo Gómez', email: 'facu.gomez@escuela.edu.ar', role: 'student', school: 'Colegio San Martín', status: 'Activo', xp: 1250 },
    { id: 'u2', name: 'Prof. Santiago Ramos', email: 'santiago.ramos@escuela.edu.ar', role: 'teacher', school: 'Colegio San Martín', status: 'Activo', xp: 9400 },
    { id: 'u3', name: 'Ana Belén Martínez', email: 'ana.martinez@tecnica1.edu.ar', role: 'student', school: 'Escuela Técnica N°1', status: 'Activo', xp: 2180 },
    { id: 'u4', name: 'Prof. Carla Véliz', email: 'carla.veliz@itba.edu.ar', role: 'teacher', school: 'Instituto Tecnológico', status: 'Activo', xp: 14200 },
    { id: 'u5', name: 'Martín Bossi', email: 'm.bossi@sanmartin.edu.ar', role: 'student', school: 'Colegio San Martín', status: 'Pendiente', xp: 450 },
    { id: 'u6', name: 'Admin Root PlayCode', email: 'admin@playcode.edu', role: 'admin', school: 'Ministerio de Educación', status: 'Activo', xp: 25000 }
  ],
  schools: [
    { id: 's1', name: 'Colegio San Martín', province: 'Buenos Aires', studentsCount: 420, teachersCount: 14, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's2', name: 'Escuela Técnica N°1 "Ing. Huergo"', province: 'Córdoba', studentsCount: 680, teachersCount: 22, plan: 'Plan Educativo Pro', status: 'Activo' },
    { id: 's3', name: 'Instituto Tecnológico Belgrano', province: 'Santa Fe', studentsCount: 310, teachersCount: 9, plan: 'Estándar', status: 'Activo' },
    { id: 's4', name: 'Colegio Nacional de La Plata', province: 'Buenos Aires', studentsCount: 540, teachersCount: 18, plan: 'Plan Educativo Pro', status: 'Activo' }
  ],
  xpMultiplier: 1.5,
  baseXp: 15,
  streakBonusXp: 50,
  clusters: [
    { name: 'cluster-runner-ar-01', status: '100% OK (12ms)', healthy: true },
    { name: 'cluster-runner-ar-02', status: '100% OK (15ms)', healthy: true },
    { name: 'cluster-evaluator-backup', status: 'Standby OK', healthy: false }
  ],
  clusterFooter: { scaling: 'Auto-scaling: Activo (AWS sa-east-1)', latency: 'Latencia avg: 13.5ms' },
  logs: [
    { text: '[SYSTEM] Core cluster init: 14 nodes ready.', muted: true },
    { text: '[AUTH] JWT session verified for user u1 (Facundo Gómez).' },
    { text: '[EXEC] Sandbox container runner-01 executed main.py in 18ms.' },
    { text: '[EVAL] Test suite passed (4/4 assertions valid).' },
    { text: '[REWARD] +20 XP dispatched to user u1.' },
    { text: '[INFO] Database replica sync completed without lag.', muted: true },
    { text: '[HEARTBEAT] All clusters operational at 100% health.' }
  ]
};

// Example students for the "Progreso" view (demo mode only).
export const DEMO_STUDENT_PROGRESS: StudentProgressRecord[] = [
  {
    id: 'sp_juan',
    name: 'Juan Pérez',
    avatarUrl: AVATAR_IMAGES.facuVector,
    grade: '8° Año A',
    school: 'Colegio San Martín',
    courseName: 'Introducción a la Programación',
    isActive: true,
    lastActivity: 'Hoy 18:42',
    streakDays: 4,
    bestStreakDays: 9,
    totalXp: 1240,
    xpProgressPercent: 68,
    badgesUnlocked: 5,
    badgesTotal: 8,
    overallProgress: 68,
    exercisesSolved: 34,
    exercisesTotal: 50,
    accuracy: 82,
    units: [
      { label: 'Unidad 1 — Variables', percent: 100 },
      { label: 'Unidad 2 — Condicionales', percent: 85 },
      { label: 'Unidad 3 — Bucles', percent: 60 },
      { label: 'Unidad 4 — Funciones', percent: 30 },
      { label: 'Unidad 5 — Arrays', percent: 0 }
    ],
    correctAnswers: 34,
    incorrectAnswers: 16,
    practiceThisWeek: '3h 25m',
    practiceDailyAverage: '29m',
    practiceByDay: [
      { day: 'Lun', minutes: 45 },
      { day: 'Mar', minutes: 80 },
      { day: 'Mié', minutes: 35 },
      { day: 'Jue', minutes: 50 },
      { day: 'Vie', minutes: 0 },
      { day: 'Sáb', minutes: 40 },
      { day: 'Dom', minutes: 55 }
    ],
    attentionAreas: [
      { title: 'Bucles', detail: '6 ejercicios incorrectos en esta unidad', status: 'reinforce' },
      { title: 'Funciones', detail: '4 ejercicios incorrectos', status: 'reinforce' },
      { title: 'Arrays', detail: 'Aún no completó esta unidad', status: 'pending' }
    ],
    recentActivity: [
      { when: 'Hoy 18:42', exercise: 'Ejercicio 12 — Bucles', correct: true },
      { when: 'Hoy 17:20', exercise: 'Ejercicio 11 — Bucles', correct: false },
      { when: 'Ayer 16:05', exercise: 'Ejercicio 10 — Funciones', correct: true },
      { when: 'Ayer 14:30', exercise: 'Ejercicio 9 — Condicionales', correct: true },
      { when: '23/09 18:12', exercise: 'Ejercicio 8 — Condicionales', correct: false }
    ]
  },
  {
    id: 'sp_ana',
    name: 'Ana García',
    avatarUrl: AVATAR_IMAGES.ana,
    grade: '8° Año A',
    school: 'Colegio San Martín',
    courseName: 'Introducción a la Programación',
    isActive: true,
    lastActivity: 'Hoy 15:10',
    streakDays: 12,
    bestStreakDays: 12,
    totalXp: 2180,
    xpProgressPercent: 85,
    badgesUnlocked: 7,
    badgesTotal: 8,
    overallProgress: 88,
    exercisesSolved: 44,
    exercisesTotal: 50,
    accuracy: 91,
    units: [
      { label: 'Unidad 1 — Variables', percent: 100 },
      { label: 'Unidad 2 — Condicionales', percent: 100 },
      { label: 'Unidad 3 — Bucles', percent: 95 },
      { label: 'Unidad 4 — Funciones', percent: 80 },
      { label: 'Unidad 5 — Arrays', percent: 55 }
    ],
    correctAnswers: 44,
    incorrectAnswers: 6,
    practiceThisWeek: '5h 10m',
    practiceDailyAverage: '44m',
    practiceByDay: [
      { day: 'Lun', minutes: 50 },
      { day: 'Mar', minutes: 60 },
      { day: 'Mié', minutes: 40 },
      { day: 'Jue', minutes: 55 },
      { day: 'Vie', minutes: 30 },
      { day: 'Sáb', minutes: 35 },
      { day: 'Dom', minutes: 40 }
    ],
    attentionAreas: [
      { title: 'Arrays', detail: '2 ejercicios incorrectos en esta unidad', status: 'reinforce' }
    ],
    recentActivity: [
      { when: 'Hoy 15:10', exercise: 'Ejercicio 22 — Arrays', correct: true },
      { when: 'Hoy 14:45', exercise: 'Ejercicio 21 — Arrays', correct: false },
      { when: 'Ayer 19:02', exercise: 'Ejercicio 20 — Funciones', correct: true },
      { when: 'Ayer 18:30', exercise: 'Ejercicio 19 — Funciones', correct: true }
    ]
  },
  {
    id: 'sp_luis',
    name: 'Luis Fernández',
    avatarUrl: AVATAR_IMAGES.luis,
    grade: '8° Año B',
    school: 'Colegio San Martín',
    courseName: 'Introducción a la Programación',
    isActive: false,
    lastActivity: '18/09 11:20',
    streakDays: 0,
    bestStreakDays: 3,
    totalXp: 380,
    xpProgressPercent: 19,
    badgesUnlocked: 1,
    badgesTotal: 8,
    overallProgress: 22,
    exercisesSolved: 11,
    exercisesTotal: 50,
    accuracy: 58,
    units: [
      { label: 'Unidad 1 — Variables', percent: 70 },
      { label: 'Unidad 2 — Condicionales', percent: 20 },
      { label: 'Unidad 3 — Bucles', percent: 0 },
      { label: 'Unidad 4 — Funciones', percent: 0 },
      { label: 'Unidad 5 — Arrays', percent: 0 }
    ],
    correctAnswers: 11,
    incorrectAnswers: 8,
    practiceThisWeek: '0m',
    practiceDailyAverage: '0m',
    practiceByDay: [
      { day: 'Lun', minutes: 0 },
      { day: 'Mar', minutes: 0 },
      { day: 'Mié', minutes: 0 },
      { day: 'Jue', minutes: 0 },
      { day: 'Vie', minutes: 0 },
      { day: 'Sáb', minutes: 0 },
      { day: 'Dom', minutes: 0 }
    ],
    attentionAreas: [
      { title: 'Condicionales', detail: '5 ejercicios incorrectos en esta unidad', status: 'reinforce' },
      { title: 'Bucles', detail: 'Aún no comenzó esta unidad', status: 'pending' }
    ],
    recentActivity: [
      { when: '18/09 11:20', exercise: 'Ejercicio 5 — Condicionales', correct: false },
      { when: '18/09 10:55', exercise: 'Ejercicio 4 — Condicionales', correct: true },
      { when: '17/09 16:40', exercise: 'Ejercicio 3 — Variables', correct: true }
    ]
  }
];

// ---------------------------------------------------------------------------
// Demo: datos de ejemplo para el inicio del alumno (solo se usan en modo demo).
// ---------------------------------------------------------------------------

export interface DemoHomeCourse {
  id: string;
  title: string;
  // Texto corto que se muestra dentro del cuadro de color (ej. "JS", "C++").
  initials: string;
  // Color del cuadro y de la barra de progreso.
  color: string;
  percent: number;
}

export interface DemoHomeAchievement {
  id: string;
  title: string;
  iconName: string;
  color: string;
  unlocked: boolean;
}

export interface DemoHomeActivity {
  id: string;
  text: string;
  timeAgo: string;
  iconName: string;
  color: string;
}

export const DEMO_STUDENT_HOME = {
  courses: [
    { id: 'dc1', title: 'JavaScript Básico', initials: 'JS', color: '#d97706', percent: 100 },
    { id: 'dc2', title: 'Introducción a C++', initials: 'C++', color: '#2563eb', percent: 30 },
    { id: 'dc3', title: 'CSS Avanzado', initials: 'CSS', color: '#7c3aed', percent: 75 },
    { id: 'dc4', title: 'React Inicial', initials: 'Re', color: '#0891b2', percent: 0 },
    { id: 'dc5', title: 'Node.js Fundamentos', initials: 'No', color: '#16a34a', percent: 20 },
    { id: 'dc6', title: 'Git Básico', initials: 'Git', color: '#ea580c', percent: 50 },
  ] as DemoHomeCourse[],

  achievements: [
    { id: 'da1', title: 'Primer curso', iconName: 'emoji_events', color: '#16a34a', unlocked: true },
    { id: 'da2', title: 'Racha 7 días', iconName: 'local_fire_department', color: '#7c3aed', unlocked: true },
    { id: 'da3', title: '10 lecciones', iconName: 'code', color: '#2563eb', unlocked: true },
    { id: 'da4', title: 'Próximamente', iconName: 'lock', color: '#94a3b8', unlocked: false },
  ] as DemoHomeAchievement[],

  activity: [
    { id: 'dact1', text: 'Completaste Unidad 1 - Introducción', timeAgo: 'Hace 2 días', iconName: 'check_circle', color: '#16a34a' },
    { id: 'dact2', text: 'Viste una lección de CSS', timeAgo: 'Hace 3 días', iconName: 'play_circle', color: '#2563eb' },
    { id: 'dact3', text: 'Completaste un quiz', timeAgo: 'Hace 4 días', iconName: 'check_circle', color: '#16a34a' },
  ] as DemoHomeActivity[],

  tip: 'La práctica constante es la clave. Intenta resolver pequeños ejercicios todos los días.',
};
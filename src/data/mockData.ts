import { Course, UserProfile, AchievementBadge, ActivityItem, ExerciseHistoryItem, InstitutionStats } from '../types';

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
  generalProgress: 78
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
    progressPercent: 100,
    completedLessons: 15,
    totalLessons: 15,
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
    progressPercent: 65,
    completedLessons: 13,
    totalLessons: 20,
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
    progressPercent: 20,
    completedLessons: 4,
    totalLessons: 20,
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

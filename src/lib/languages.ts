// Metadatos por lenguaje de ejercicio (Exercise.language) para la UI del editor.
export interface LanguageInfo {
  label: string;
  fileName: string;
  placeholder: string;
  // Categoria que se muestra en la tarjeta del curso.
  category: string;
  color: string;
  iconName: string;
}

export const LANGUAGES: Record<string, LanguageInfo> = {
  python: { label: 'Python 3.10', fileName: 'main.py', placeholder: '# Escribe tu código aquí...', category: 'Python', color: '#16A34A', iconName: 'code' },
  javascript: { label: 'JavaScript', fileName: 'main.js', placeholder: '// Escribe tu código aquí...', category: 'JavaScript', color: '#CA8A04', iconName: 'javascript' },
  html: { label: 'HTML y CSS', fileName: 'index.html', placeholder: '<!-- Escribe tu código aquí -->', category: 'HTML y CSS', color: '#EA580C', iconName: 'html' },
  quiz: { label: 'Cuestionario', fileName: 'respuesta', placeholder: '', category: 'Cuestionario', color: '#7C3AED', iconName: 'quiz' },
  sql: { label: 'SQLite', fileName: 'consulta.sql', placeholder: '-- Escribe tu consulta aquí', category: 'SQL', color: '#2563EB', iconName: 'database' },
};

export const languageInfo = (language: string): LanguageInfo => LANGUAGES[language] ?? LANGUAGES.python;

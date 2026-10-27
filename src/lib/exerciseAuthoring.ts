// Autoria de ejercicios (panel de admin): convierte lo que escribe el admin en lo que guarda
// el servidor, y calcula los resultados esperados EJECUTANDO la solucion de referencia con
// los mismos ejecutores que usan los alumnos (Pyodide, JavaScript, SQLite, HTML en iframe).
// Asi el admin nunca tiene que escribir a mano un JSON de filas o de mediciones del DOM.
import type { AdminExercise, AdminTestCase } from '../auth/api';
import type { DomQuery } from './htmlExec';
import { runExercise } from './codeRunner';

export interface LanguageChoice {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const LANGUAGE_CHOICES: LanguageChoice[] = [
  { id: 'python', label: 'Python', icon: 'code', description: 'El alumno escribe un programa; se compara lo que imprime.' },
  { id: 'javascript', label: 'JavaScript', icon: 'javascript', description: 'Igual que Python, ejecutado en el navegador del alumno.' },
  { id: 'sql', label: 'SQL', icon: 'database', description: 'Consultas sobre una base SQLite de ejemplo; se comparan filas y columnas.' },
  { id: 'html', label: 'HTML y CSS', icon: 'html', description: 'El alumno arma una página; se revisa el resultado en pantalla.' },
  { id: 'quiz', label: 'Opción múltiple', icon: 'quiz', description: 'Preguntas con opciones, sin código: para teoría de cualquier tema (p. ej. Java).' },
];

export const languageLabel = (id: string) => LANGUAGE_CHOICES.find((l) => l.id === id)?.label ?? id;

// ─── Chequeos de HTML/CSS ───────────────────────────────────────────────────
export type HtmlCheckKind = 'count' | 'text' | 'texts' | 'hasText' | 'attr' | 'attrAll' | 'style' | 'styleAll' | 'rect';

export interface HtmlCheck {
  selector: string;
  kind: HtmlCheckKind;
  // Nombre del atributo (href, alt...) o de la propiedad CSS en camelCase (color, marginLeft...).
  property: string;
}

export const HTML_CHECK_KINDS: { id: HtmlCheckKind; label: string; needsProperty: boolean; hint: string }[] = [
  { id: 'count', label: 'Cantidad de elementos', needsProperty: false, hint: 'Cuántos elementos coinciden con el selector.' },
  { id: 'text', label: 'Texto del elemento', needsProperty: false, hint: 'El texto del primer elemento.' },
  { id: 'texts', label: 'Texto de todos', needsProperty: false, hint: 'El texto de cada elemento, en orden.' },
  { id: 'hasText', label: 'Tiene texto', needsProperty: false, hint: 'El elemento no está vacío (para texto libre).' },
  { id: 'attr', label: 'Atributo', needsProperty: true, hint: 'Valor de un atributo: href, src, alt…' },
  { id: 'attrAll', label: 'Atributo de todos', needsProperty: true, hint: 'Valor del atributo en cada elemento.' },
  { id: 'style', label: 'Estilo calculado', needsProperty: true, hint: 'Propiedad CSS del primer elemento: color, backgroundColor, marginLeft…' },
  { id: 'styleAll', label: 'Estilo de todos', needsProperty: true, hint: 'Propiedad CSS en cada elemento.' },
  { id: 'rect', label: 'Posición y tamaño', needsProperty: false, hint: 'x, y, ancho y alto de cada elemento (viewport de 800 px).' },
];

/** Chequeos (lo que ve el admin) → consultas que entiende el ejecutor (htmlExec). */
export function checksToQueries(checks: HtmlCheck[]): DomQuery[] {
  const queries: DomQuery[] = [];
  for (const check of checks) {
    if (!check.selector.trim()) continue;
    // Chequeos seguidos con el mismo selector comparten una consulta.
    let query = queries[queries.length - 1];
    if (!query || query.selector !== check.selector.trim()) {
      query = { selector: check.selector.trim() };
      queries.push(query);
    }
    const property = check.property.trim();
    switch (check.kind) {
      case 'count': query.count = true; break;
      case 'text': query.text = true; break;
      case 'texts': query.texts = true; break;
      case 'hasText': query.hasText = true; break;
      case 'rect': query.rects = true; break;
      case 'attr': if (property) query.attrs = [...(query.attrs ?? []), property]; break;
      case 'attrAll': if (property) query.attrsAll = [...(query.attrsAll ?? []), property]; break;
      case 'style': if (property) query.styles = [...(query.styles ?? []), property]; break;
      case 'styleAll': if (property) query.stylesAll = [...(query.stylesAll ?? []), property]; break;
    }
  }
  return queries;
}

/** Consultas guardadas → chequeos, para volver a editar un ejercicio existente. */
export function queriesToChecks(queries: DomQuery[]): HtmlCheck[] {
  return queries.flatMap((q) => {
    const checks: HtmlCheck[] = [];
    const add = (kind: HtmlCheckKind, property = '') => checks.push({ selector: q.selector, kind, property });
    if (q.count) add('count');
    if (q.text) add('text');
    if (q.texts) add('texts');
    if (q.hasText) add('hasText');
    (q.attrs ?? []).forEach((a) => add('attr', a));
    (q.attrsAll ?? []).forEach((a) => add('attrAll', a));
    (q.styles ?? []).forEach((a) => add('style', a));
    (q.stylesAll ?? []).forEach((a) => add('styleAll', a));
    if (q.rects) add('rect');
    return checks;
  });
}

// ─── Casos de prueba en edicion ─────────────────────────────────────────────
export interface AuthoringCase {
  key: string;
  isHidden: boolean;
  /** Python y JavaScript: lo que recibe el programa por input(). */
  input: string;
  /** Salida esperada. En SQL y HTML es el resultado calculado (JSON) y no se escribe a mano. */
  expectedOutput: string;
  /** SQL: script que crea y llena la base de ejemplo de este caso. */
  setup: string;
  /** HTML/CSS: que se mide en la pagina. */
  checks: HtmlCheck[];
  /** Opcion multiple: textos de las opciones y cual es la correcta (indice). */
  options: string[];
  correct: number;
}

let caseCounter = 0;
export const newCase = (overrides: Partial<AuthoringCase> = {}): AuthoringCase => ({
  key: `case-${Date.now()}-${caseCounter++}`,
  isHidden: false,
  input: '',
  expectedOutput: '',
  setup: '',
  checks: [],
  options: ['', ''],
  correct: 0,
  ...overrides,
});

/** Casos guardados en el servidor → casos editables. */
export function casesFromExercise(exercise: AdminExercise): AuthoringCase[] {
  return exercise.testCases.map((tc: AdminTestCase) => {
    const spec = (tc.spec ?? {}) as { setup?: string; measure?: DomQuery[]; options?: string[] };
    return newCase({
      options: spec.options ?? ['', ''],
      correct: Number(tc.expectedOutput) || 0,
      isHidden: tc.isHidden,
      input: tc.input ?? '',
      expectedOutput: tc.expectedOutput,
      setup: spec.setup ?? '',
      checks: spec.measure ? queriesToChecks(spec.measure) : [],
    });
  });
}

/** Casos editables → lo que recibe el ejecutor del navegador. */
export function runnerCases(language: string, cases: AuthoringCase[]) {
  return cases.map((c) => ({
    id: c.key,
    input: c.input,
    spec: language === 'sql' ? { setup: c.setup } : language === 'html' ? { measure: checksToQueries(c.checks) } : undefined,
  }));
}

/** Casos editables → casos de prueba que se guardan. */
export function casesToPayload(language: string, cases: AuthoringCase[], sqlOrdered: boolean) {
  if (language === 'quiz') {
    const c = cases[0];
    return [{ input: '', expectedOutput: String(c.correct), isHidden: true, compareMode: 'text', spec: { options: c.options.map((o) => o.trim()) } }];
  }
  return cases.map((c) => ({
    input: language === 'python' || language === 'javascript' ? c.input : '',
    expectedOutput: c.expectedOutput,
    isHidden: c.isHidden,
    compareMode: language === 'sql' ? (sqlOrdered ? 'rows_ordered' : 'rows_unordered') : language === 'html' ? 'dom' : 'text',
    spec: language === 'sql' ? { setup: c.setup } : language === 'html' ? { measure: checksToQueries(c.checks) } : undefined,
  }));
}

/** Problemas que impiden calcular o guardar, en castellano (null si todo esta bien). */
export function validateCases(language: string, cases: AuthoringCase[]): string | null {
  if (language === 'quiz') {
    const c = cases[0];
    if (!c) return 'Agregá las opciones de la pregunta.';
    const options = c.options.map((o) => o.trim());
    if (options.length < 2) return 'Agregá al menos 2 opciones.';
    if (options.some((o) => !o)) return 'Completá todas las opciones o quitá las que sobren.';
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return 'Hay opciones repetidas.';
    if (c.correct < 0 || c.correct >= options.length) return 'Marcá cuál es la respuesta correcta.';
    return null;
  }
  if (cases.length === 0) return 'Agregá al menos un caso de prueba.';
  for (const [i, c] of cases.entries()) {
    if (language === 'sql' && !c.setup.trim()) return `Caso ${i + 1}: falta el script de la base de datos de ejemplo.`;
    if (language === 'html' && checksToQueries(c.checks).length === 0) return `Caso ${i + 1}: agregá al menos un chequeo con su selector.`;
  }
  if (!cases.some((c) => !c.isHidden)) return 'Al menos un caso tiene que ser visible para el alumno (no oculto).';
  return null;
}

export interface ComputeResult {
  /** Salida calculada de cada caso (en el mismo orden). */
  outputs?: string[];
  error?: string;
}

/** Corre `code` con cada caso y devuelve la salida cruda de cada uno. */
export async function runCases(language: string, code: string, cases: AuthoringCase[]): Promise<ComputeResult> {
  const problem = validateCases(language, cases);
  if (problem) return { error: problem };
  const { outputs, infraError } = await runExercise(language, code, runnerCases(language, cases));
  if (infraError) return { error: `No se pudo ejecutar: ${infraError}` };

  const byId = new Map(outputs.map((o) => [o.testCaseId, o]));
  const result: string[] = [];
  for (const [i, c] of cases.entries()) {
    const out = byId.get(c.key);
    if (!out) return { error: `Caso ${i + 1}: no se obtuvo resultado.` };
    if (out.timedOut) return { error: `Caso ${i + 1}: la solución tardó demasiado (¿hay un bucle infinito?).` };
    if (out.stderr && !out.stdout) return { error: `Caso ${i + 1}: la solución falló al ejecutarse: ${out.stderr}` };
    result.push(out.stdout);
  }
  return { outputs: result };
}

/** Ejemplo para empezar a escribir consultas SQL. */
export const SQL_SAMPLE_SETUP = `CREATE TABLE alumnos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  nota INTEGER NOT NULL
);
INSERT INTO alumnos VALUES
  (1, 'Ana', 'Rosario', 9),
  (2, 'Bruno', 'Córdoba', 6),
  (3, 'Carla', 'Rosario', 7),
  (4, 'Diego', 'Mendoza', 4);`;

/** Codigo inicial sugerido para un ejercicio nuevo segun el lenguaje. */
export const STARTER_TEMPLATES: Record<string, string> = {
  quiz: '',
  python: '# Escribí tu código acá\n',
  javascript: '// Leé los datos con input() y mostrá el resultado con console.log\n',
  sql: '-- Escribí tu consulta acá\n',
  html: '<style>\n  /* tus reglas */\n</style>\n\n<!-- tu HTML -->\n',
};

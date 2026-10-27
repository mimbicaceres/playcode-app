// Comparacion server-side entre la salida que reporto el alumno (ejecutada en su
// navegador: Pyodide, JS, SQLite o un iframe para HTML/CSS) y el expectedOutput
// real guardado en la base de datos. El cliente nunca manda un veredicto de
// exito: solo manda stdout/stderr crudos por test case, y esta funcion es la
// unica autoridad que decide si pasaron.

// "text": stdout comparado linea a linea. "rows_*": JSON {columns, rows} de una
// consulta SQL (el orden de filas solo importa en rows_ordered). "dom": JSON con
// las mediciones del DOM que pidio el spec del caso.
export type CompareMode = 'text' | 'rows_ordered' | 'rows_unordered' | 'dom';

export interface TestCaseForGrading {
  id: string;
  expectedOutput: string;
  isHidden: boolean;
  compareMode?: string;
}

export interface ReportedOutput {
  testCaseId: string;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface GradedTestCase {
  testCaseId: string;
  passed: boolean;
  isHidden: boolean;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  timedOut: boolean;
}

export interface GradeResult {
  allPassed: boolean;
  results: GradedTestCase[];
}

// Normaliza diferencias triviales de formato (saltos de linea, espacios al
// final) para no reprobar por algo que el alumno no puede controlar.
function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

const NUMBER_TOLERANCE = 1e-9;

function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= NUMBER_TOLERANCE;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    return (
      keysA.length === keysB.length &&
      keysA.every((key, i) => key === keysB[i] && sameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
    );
  }
  return a === b;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

interface RowsResult {
  columns: string[];
  rows: unknown[][];
}

function asRowsResult(value: unknown): RowsResult | null {
  if (!value || typeof value !== 'object') return null;
  const { columns, rows } = value as Record<string, unknown>;
  if (!Array.isArray(columns) || !Array.isArray(rows)) return null;
  if (!columns.every((c) => typeof c === 'string') || !rows.every(Array.isArray)) return null;
  return { columns: (columns as string[]).map((c) => c.toLowerCase()), rows: rows as unknown[][] };
}

const rowKey = (row: unknown[]) => JSON.stringify(row);

function rowsMatch(actual: string, expected: string, ordered: boolean): boolean {
  const a = asRowsResult(parseJson(actual));
  const e = asRowsResult(parseJson(expected));
  if (!a || !e) return false;
  if (!sameValue(a.columns, e.columns) || a.rows.length !== e.rows.length) return false;
  if (ordered) return sameValue(a.rows, e.rows);
  const sortRows = (rows: unknown[][]) => [...rows].sort((x, y) => rowKey(x).localeCompare(rowKey(y)));
  return sameValue(sortRows(a.rows), sortRows(e.rows));
}

function outputsMatch(mode: string | undefined, actual: string, expected: string): boolean {
  switch (mode) {
    case 'rows_ordered':
      return rowsMatch(actual, expected, true);
    case 'rows_unordered':
      return rowsMatch(actual, expected, false);
    case 'dom': {
      const a = parseJson(actual);
      const e = parseJson(expected);
      return a !== undefined && e !== undefined && sameValue(a, e);
    }
    default:
      return normalizeOutput(actual) === normalizeOutput(expected);
  }
}

export function gradeSubmission(
  testCases: TestCaseForGrading[],
  outputs: ReportedOutput[],
): GradeResult {
  const outputsByTestCase = new Map(outputs.map((output) => [output.testCaseId, output]));

  const results: GradedTestCase[] = testCases.map((testCase) => {
    const reported = outputsByTestCase.get(testCase.id);
    // Si el cliente no reporto nada para este test case, se trata como no verificado.
    const timedOut = reported?.timedOut ?? true;
    const actualOutput = reported?.stdout ?? '';
    const passed = !timedOut && outputsMatch(testCase.compareMode, actualOutput, testCase.expectedOutput);

    return {
      testCaseId: testCase.id,
      passed,
      isHidden: testCase.isHidden,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      stderr: reported?.stderr ?? '',
      timedOut,
    };
  });

  return {
    allPassed: results.length > 0 && results.every((result) => result.passed),
    results,
  };
}

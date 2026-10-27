// Despacha la ejecucion de un ejercicio al runner de su lenguaje. Todos
// devuelven el mismo formato (RunSubmissionResult): salida cruda por test case.
// Nunca deciden si el alumno aprobo; eso lo hace el backend (codeGrader.ts).
import { RunSubmissionResult, RunnerTestCase, runTestCases as runPython } from './pyodideRunner';
import { runJsTestCases } from './jsRunner';
import { runSqlTestCases } from './sqlRunner';
import { runHtmlTestCases } from './htmlRunner';
import { runQuizTestCases } from './quizRunner';

export type { RunnerTestCase, RunSubmissionResult };

type Runner = (code: string, testCases: RunnerTestCase[]) => Promise<RunSubmissionResult>;

// Cada curso nuevo registra aca su runner (javascript, sql, html).
const RUNNERS: Record<string, Runner> = {
  python: runPython,
  javascript: runJsTestCases,
  sql: runSqlTestCases,
  html: runHtmlTestCases,
  quiz: runQuizTestCases,
};

export function runExercise(language: string, code: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  const runner = RUNNERS[language];
  if (!runner) {
    // No es un intento fallido del alumno: el backend responde 503 y no cuenta.
    return Promise.resolve({ outputs: [], infraError: `No hay ejecutor para el lenguaje "${language}".` });
  }
  return runner(code, testCases);
}

// Runner de HTML y CSS: renderiza el codigo del alumno en un iframe aislado y
// mide el DOM resultante para cada test case (ver htmlExec.ts). No hay Worker
// porque hace falta un DOM real; el iframe no ejecuta scripts, asi que no hay
// bucles infinitos posibles.
import { DomQuery, HTML_VIEWPORT, htmlExec } from './htmlExec';
import { RunnerTestCase, RunSubmissionResult } from './pyodideRunner';

export async function runHtmlTestCases(code: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  const groups = testCases.map((testCase) => (testCase.spec as { measure?: DomQuery[] } | undefined)?.measure ?? []);
  try {
    const measurements = await htmlExec(code, groups, HTML_VIEWPORT);
    return {
      outputs: testCases.map((testCase, i) => ({ testCaseId: testCase.id, stdout: measurements[i], stderr: '', timedOut: false })),
    };
  } catch (error) {
    return { outputs: [], infraError: error instanceof Error ? error.message : String(error) };
  }
}

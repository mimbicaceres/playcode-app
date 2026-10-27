// Ejecutor de ejercicios de opcion multiple: no ejecuta nada. La "salida" de cada caso es la
// opcion que eligio el alumno (su indice: "0", "1"...); el servidor la compara con la correcta,
// que nunca viaja al navegador.
import { RunnerTestCase, RunSubmissionResult } from './pyodideRunner';

export async function runQuizTestCases(selectedIndex: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  return {
    outputs: testCases.map((testCase) => ({ testCaseId: testCase.id, stdout: selectedIndex, stderr: '', timedOut: false })),
  };
}

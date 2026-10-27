// Corre el JavaScript del alumno en un Web Worker descartable (uno por
// ejecucion): si el codigo tiene un bucle infinito, el timeout termina el
// worker y listo, sin contaminar la siguiente ejecucion.
import { RunnerOutput, RunnerTestCase, RunSubmissionResult } from './pyodideRunner';

const RUN_TIMEOUT_MS = 5000;

export function runJsTestCases(code: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const worker = new Worker(new URL('../workers/jsWorker.ts', import.meta.url), { type: 'module' });

    const finish = (result: RunSubmissionResult) => {
      clearTimeout(timeoutHandle);
      worker.terminate();
      resolve(result);
    };

    const timeoutHandle = setTimeout(() => {
      finish({
        outputs: testCases.map((testCase) => ({ testCaseId: testCase.id, stdout: '', stderr: '', timedOut: true })),
      });
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      if (event.data?.requestId !== requestId) return;
      finish({ outputs: event.data.outputs as RunnerOutput[] });
    };
    worker.onerror = (event) => finish({ outputs: [], infraError: event.message || 'El ejecutor de JavaScript falló.' });

    worker.postMessage({
      type: 'run',
      requestId,
      code,
      testCases: testCases.map((testCase) => ({ id: testCase.id, input: testCase.input ?? '' })),
    });
  });
}

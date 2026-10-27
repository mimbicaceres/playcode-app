// Corre la consulta SQL del alumno en un Web Worker descartable (uno por
// ejecucion): una consulta que no termina (p. ej. un CTE recursivo infinito)
// se corta terminando el worker. El .wasm queda en la cache del navegador.
import { RunnerOutput, RunnerTestCase, RunSubmissionResult } from './pyodideRunner';

const RUN_TIMEOUT_MS = 10000;

export function runSqlTestCases(code: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const worker = new Worker(new URL('../workers/sqlWorker.ts', import.meta.url), { type: 'module' });

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
      if (event.data.type === 'result') finish({ outputs: event.data.outputs as RunnerOutput[] });
      else finish({ outputs: [], infraError: event.data.message as string });
    };
    worker.onerror = (event) => finish({ outputs: [], infraError: event.message || 'El ejecutor de SQL falló.' });

    worker.postMessage({
      type: 'run',
      requestId,
      code,
      testCases: testCases.map((testCase) => ({ id: testCase.id, spec: testCase.spec })),
    });
  });
}

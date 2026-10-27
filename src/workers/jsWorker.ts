// Worker que corre el JavaScript del alumno contra una lista de test cases.
// Igual que el de Pyodide, NUNCA decide si aprobo: solo reporta la salida cruda
// de cada corrida (la comparacion vive en server/src/lib/codeGrader.ts).
import { runJsCase } from '../lib/jsExec';

const ctx = self as unknown as Worker;

interface RunRequest {
  type: 'run';
  requestId: string;
  code: string;
  testCases: { id: string; input: string }[];
}

ctx.onmessage = (event: MessageEvent<RunRequest>) => {
  const { type, requestId, code, testCases } = event.data;
  if (type !== 'run') return;
  const outputs = testCases.map((testCase) => ({
    testCaseId: testCase.id,
    ...runJsCase(code, testCase.input),
    timedOut: false,
  }));
  ctx.postMessage({ type: 'result', requestId, outputs });
};

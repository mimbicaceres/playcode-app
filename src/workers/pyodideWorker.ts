// Worker clasico (no module) que carga Pyodide desde el CDN oficial y corre
// el codigo Python del alumno contra una lista de test cases, simulando
// stdin y capturando stdout/stderr. Este worker NUNCA decide si el alumno
// aprobo: solo reporta la salida cruda de cada corrida. La comparacion
// contra el expectedOutput real vive en el backend (server/src/lib/codeGrader.ts).

declare function importScripts(...urls: string[]): void;
declare function loadPyodide(options: { indexURL: string }): Promise<PyodideInterface>;

interface PyProxyDict {
  set(key: string, value: unknown): void;
  destroy(): void;
}

interface PyodideInterface {
  globals: { get(name: string): () => PyProxyDict };
  toPy(value: unknown): unknown;
  setStdout(options: { batched: (msg: string) => void }): void;
  setStderr(options: { batched: (msg: string) => void }): void;
  runPython(code: string, options?: { globals: PyProxyDict }): unknown;
}

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const ctx = self as unknown as Worker;

interface RunTestCaseInput {
  id: string;
  input: string;
}

interface RunRequest {
  type: 'run';
  requestId: string;
  code: string;
  testCases: RunTestCaseInput[];
}

interface RunOutput {
  testCaseId: string;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

let pyodideInstance: PyodideInterface | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodideInstance) {
    importScripts(`${PYODIDE_CDN_URL}pyodide.js`);
    pyodideInstance = await loadPyodide({ indexURL: PYODIDE_CDN_URL });
  }
  return pyodideInstance;
}

// Simula input() con las lineas del test case y corre el codigo en un
// namespace (globals) fresco, para que no haya fuga de estado entre casos.
async function runOne(
  pyodide: PyodideInterface,
  code: string,
  input: string,
): Promise<Omit<RunOutput, 'testCaseId'>> {
  let stdout = '';
  let stderr = '';
  pyodide.setStdout({ batched: (msg) => { stdout += `${msg}\n`; } });
  pyodide.setStderr({ batched: (msg) => { stderr += `${msg}\n`; } });

  const globals = pyodide.globals.get('dict')();
  try {
    const inputLines = input.length > 0 ? input.split('\n') : [];
    globals.set('_INPUT_QUEUE', pyodide.toPy(inputLines));
    pyodide.runPython(
      `
import builtins as _builtins
_queue = list(_INPUT_QUEUE)
def _fake_input(prompt=''):
    return _queue.pop(0) if _queue else ''
_builtins.input = _fake_input
`,
      { globals },
    );
    pyodide.runPython(code, { globals });
    return { stdout: stdout.trim(), stderr: stderr.trim(), timedOut: false };
  } catch (error) {
    return {
      stdout: stdout.trim(),
      stderr: error instanceof Error ? error.message : String(error),
      timedOut: false,
    };
  } finally {
    globals.destroy();
  }
}

ctx.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { type, requestId, code, testCases } = event.data;
  if (type !== 'run') return;

  try {
    const pyodide = await getPyodide();
    const outputs: RunOutput[] = [];
    for (const testCase of testCases) {
      const result = await runOne(pyodide, code, testCase.input);
      outputs.push({ testCaseId: testCase.id, ...result });
    }
    ctx.postMessage({ type: 'result', requestId, outputs });
  } catch (error) {
    ctx.postMessage({
      type: 'init-error',
      requestId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

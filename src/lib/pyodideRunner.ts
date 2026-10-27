// Maneja el ciclo de vida del worker de Pyodide desde el hilo principal:
// manda el codigo del alumno a correr contra los test cases, y aplica un
// timeout propio (el worker puede colgarse si el codigo tiene un loop
// infinito; la unica forma de recuperarse es terminar el worker entero).

export interface RunnerTestCase {
  id: string;
  input?: string;
  // Datos propios del runner (solo lo usan JS/SQL/HTML; Pyodide lo ignora).
  spec?: unknown;
}

export interface RunnerOutput {
  testCaseId: string;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface RunSubmissionResult {
  outputs: RunnerOutput[];
  // Fallo de infraestructura (Pyodide no pudo cargarse, o el worker se colgo):
  // esto NO es un intento fallido del alumno, hay que ofrecerle reintentar.
  infraError?: string;
}

const RUN_TIMEOUT_MS = 10000;
// La PRIMERA ejecucion tambien descarga Pyodide (varios MB) desde el CDN, y con
// el navegador en frio o una conexion lenta eso solo puede tardar mas que el
// limite normal. Hasta que el worker termine de cargar una vez, se da mas tiempo;
// despues (ya en la cache del navegador) vale el limite de siempre.
const FIRST_LOAD_TIMEOUT_MS = 60000;

let pyodideLoadedOnce = false;

let activeWorker: Worker | null = null;

function getWorker(): Worker {
  if (!activeWorker) {
    activeWorker = new Worker(new URL('../workers/pyodideWorker.ts', import.meta.url));
  }
  return activeWorker;
}

function discardWorker() {
  activeWorker?.terminate();
  activeWorker = null;
}

export function runTestCases(code: string, testCases: RunnerTestCase[]): Promise<RunSubmissionResult> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const worker = getWorker();

    const timeoutMs = pyodideLoadedOnce ? RUN_TIMEOUT_MS : FIRST_LOAD_TIMEOUT_MS;
    const timeoutHandle = setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      discardWorker();
      resolve({
        outputs: testCases.map((testCase) => ({
          testCaseId: testCase.id,
          stdout: '',
          stderr: '',
          timedOut: true,
        })),
      });
    }, timeoutMs);

    function handleMessage(event: MessageEvent) {
      if (event.data?.requestId !== requestId) return;
      clearTimeout(timeoutHandle);
      worker.removeEventListener('message', handleMessage);

      if (event.data.type === 'result') {
        pyodideLoadedOnce = true;
        resolve({ outputs: event.data.outputs as RunnerOutput[] });
      } else if (event.data.type === 'init-error') {
        resolve({ outputs: [], infraError: event.data.message as string });
      }
    }

    worker.addEventListener('message', handleMessage);
    worker.postMessage({
      type: 'run',
      requestId,
      code,
      testCases: testCases.map((testCase) => ({ id: testCase.id, input: testCase.input ?? '' })),
    });
  });
}

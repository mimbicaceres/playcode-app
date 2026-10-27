// Worker (modulo) que corre la consulta SQL del alumno con sql.js (SQLite
// compilado a WASM, empaquetado por Vite desde node_modules), con una base en
// memoria nueva por test case. Como el de Pyodide, NUNCA decide si el alumno
// aprobo: solo reporta el resultado crudo (la comparacion vive en
// server/src/lib/codeGrader.ts).
import initSqlJs from 'sql.js';
import { runSqlCase, SqlModule } from '../lib/sqlExec';

const WASM_URL = new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).href;

const ctx = self as unknown as Worker;

interface RunRequest {
  type: 'run';
  requestId: string;
  code: string;
  testCases: { id: string; spec?: { setup?: string } }[];
}

let sqlModule: SqlModule | null = null;

async function getSql(): Promise<SqlModule> {
  if (!sqlModule) sqlModule = await initSqlJs({ locateFile: () => WASM_URL });
  return sqlModule;
}

ctx.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { type, requestId, code, testCases } = event.data;
  if (type !== 'run') return;
  try {
    const SQL = await getSql();
    const outputs = testCases.map((testCase) => ({
      testCaseId: testCase.id,
      ...runSqlCase(SQL, code, testCase.spec?.setup ?? ''),
      timedOut: false,
    }));
    ctx.postMessage({ type: 'result', requestId, outputs });
  } catch (error) {
    ctx.postMessage({ type: 'init-error', requestId, message: error instanceof Error ? error.message : String(error) });
  }
};

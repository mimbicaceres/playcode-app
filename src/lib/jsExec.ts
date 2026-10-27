// Ejecuta el codigo JavaScript del alumno contra UN caso de prueba. Es una
// funcion pura (sin DOM ni Worker) para poder usarla tanto en el worker del
// navegador como en el script que verifica las soluciones de referencia.
//
// El alumno tiene dos globales: input() devuelve la siguiente linea de entrada
// (o '' si ya no hay) y console.log escribe una linea en la salida. Las demas
// consolas (error, warn, info) tambien se capturan como salida normal de log.

export interface JsCaseResult {
  stdout: string;
  stderr: string;
}

// Formato de console.log: los textos van tal cual y el resto como en String(),
// salvo objetos y arrays, que se muestran como JSON.
export function formatLogArg(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value !== null && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function runJsCase(code: string, input: string): JsCaseResult {
  const queue = input.length > 0 ? input.split('\n') : [];
  const lines: string[] = [];
  const log = (...args: unknown[]) => {
    lines.push(args.map(formatLogArg).join(' '));
  };
  const fakeConsole = { log, info: log, warn: log, error: log };
  const fakeInput = () => (queue.length > 0 ? (queue.shift() as string) : '');

  try {
    // eslint-disable-next-line no-new-func
    new Function('input', 'console', code)(fakeInput, fakeConsole);
    return { stdout: lines.join('\n').trim(), stderr: '' };
  } catch (error) {
    return { stdout: lines.join('\n').trim(), stderr: error instanceof Error ? error.message : String(error) };
  }
}

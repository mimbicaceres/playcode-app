// Ejecuta la consulta SQL del alumno contra UN caso de prueba. Funcion pura
// (sin Worker ni DOM) sobre un modulo sql.js ya inicializado, para usarla tanto
// en el worker del navegador como en el servidor (calculo del resultado
// esperado y verificacion de las soluciones de referencia).
//
// Cada caso arranca con una base SQLite NUEVA en memoria, cargada con el script
// `setup` del spec del caso. Se reporta el resultado de la ULTIMA sentencia que
// devuelve columnas, como JSON {columns, rows}; el servidor lo compara en los
// modos rows_ordered / rows_unordered (ver server/src/lib/codeGrader.ts).

export interface SqlStatement {
  getColumnNames(): string[];
  step(): boolean;
  get(): unknown[];
}

export interface SqlDatabase {
  exec(sql: string): unknown;
  iterateStatements(sql: string): Iterable<SqlStatement>;
  close(): void;
}

export interface SqlModule {
  Database: new () => SqlDatabase;
}

export interface SqlCaseResult {
  stdout: string;
  stderr: string;
}

export function runSqlCase(SQL: SqlModule, code: string, setup: string): SqlCaseResult {
  const db = new SQL.Database();
  try {
    db.exec(setup);
    let last: { columns: string[]; rows: unknown[][] } | null = null;
    // iterateStatements (y no db.exec) conserva los nombres de columna aun
    // cuando la consulta no devuelve filas.
    for (const statement of db.iterateStatements(code)) {
      const columns = statement.getColumnNames();
      const rows: unknown[][] = [];
      while (statement.step()) rows.push(statement.get());
      if (columns.length > 0) last = { columns, rows };
    }
    if (!last) {
      return { stdout: '', stderr: 'La consulta no devolvió ninguna tabla de resultados. ¿Escribiste un SELECT?' };
    }
    return { stdout: JSON.stringify(last), stderr: '' };
  } catch (error) {
    return { stdout: '', stderr: error instanceof Error ? error.message : String(error) };
  } finally {
    db.close();
  }
}

// sql.js no trae tipos propios; solo se usa la parte que describe sqlExec.ts.
declare module 'sql.js' {
  import type { SqlModule } from './lib/sqlExec';
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<SqlModule>;
  export default initSqlJs;
}

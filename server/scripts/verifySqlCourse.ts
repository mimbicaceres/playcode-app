// Verifica el curso de SQL SIN tocar la base. Para cada ejercicio comprueba, con
// el mismo motor del navegador (src/lib/sqlExec.ts) y el mismo corrector del
// servidor (src/lib/codeGrader.ts):
//   - la solucion de referencia y sus variantes correctas PASAN todos los casos;
//   - los errores tipicos y el codigo inicial NO pasan;
//   - ningun resultado esperado es vacio y el caso oculto difiere del visible.
import { gradeSubmission } from "../src/lib/codeGrader";
import { runSqlCase, SqlModule } from "../../src/lib/sqlExec";
import { casesOf, referenceOutput, SqlExercise, starterCodeOf, units } from "../prisma/seeds/sql-course";

function passes(SQL: SqlModule, code: string, e: SqlExercise): boolean {
  const cases = casesOf(e).map((c, i) => ({
    id: String(i),
    expectedOutput: referenceOutput(SQL, e, c.setup),
    isHidden: c.isHidden,
    compareMode: c.mode,
  }));
  const outputs = casesOf(e).map((c, i) => ({ testCaseId: String(i), ...runSqlCase(SQL, code, c.setup), timedOut: false }));
  return gradeSubmission(cases, outputs).allPassed;
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQL = (await require("sql.js")()) as SqlModule;
  let failures = 0;
  let total = 0;
  for (const unit of units) {
    for (const e of unit.exercises) {
      total++;
      const problems: string[] = [];
      if (!passes(SQL, e.solution, e)) problems.push("la solución de referencia no pasa");
      for (const alt of e.alternatives ?? []) if (!passes(SQL, alt, e)) problems.push(`variante correcta NO pasa: ${alt}`);
      for (const bad of e.wrong ?? []) if (passes(SQL, bad, e)) problems.push(`error típico PASA: ${bad}`);
      if (passes(SQL, starterCodeOf(e), e)) problems.push("el código inicial ya aprueba");
      if (!e.hint.trim()) problems.push("falta la pista");

      const [visible, hidden] = casesOf(e).map((c) => JSON.parse(referenceOutput(SQL, e, c.setup)) as { rows: unknown[][] });
      if (visible.rows.length === 0 || hidden.rows.length === 0) problems.push("un resultado esperado está vacío");
      if (JSON.stringify(visible) === JSON.stringify(hidden)) problems.push("el caso oculto da lo mismo que el visible");

      if (problems.length) {
        failures++;
        console.error(`✗ ${e.slug} ${e.title}:\n    ${problems.join("\n    ")}`);
      }
    }
  }
  console.log(`${total - failures}/${total} ejercicios OK`);
  process.exitCode = failures ? 1 : 0;
}
main();

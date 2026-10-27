// Verifica el curso de JavaScript SIN tocar la base: corre la solucion de
// referencia de cada ejercicio con el mismo motor que usa el navegador
// (src/lib/jsExec.ts) y la compara con el mismo corrector del servidor
// (src/lib/codeGrader.ts). Tambien comprueba que el codigo inicial, tal como
// esta, NO aprueba (si no, el ejercicio vendria resuelto).
import { gradeSubmission } from "../src/lib/codeGrader";
import { runJsCase } from "../../src/lib/jsExec";
import { units } from "../prisma/seeds/javascript-course";

const lines = (s: string) => (s.length > 0 ? s.split("\n") : []);

function passes(code: string, ex: (typeof units)[number]["exercises"][number]): boolean {
  const cases = ex.testCases.map((tc, i) => ({
    id: String(i),
    expectedOutput: ex.compute(lines(tc.input)),
    isHidden: tc.isHidden,
  }));
  const outputs = ex.testCases.map((tc, i) => ({ testCaseId: String(i), ...runJsCase(code, tc.input), timedOut: false }));
  return gradeSubmission(cases, outputs).allPassed;
}

let failures = 0;
let total = 0;
for (const unit of units) {
  for (const ex of unit.exercises) {
    total++;
    const problems: string[] = [];
    if (!passes(ex.solution, ex)) problems.push("la solución de referencia NO pasa los casos");
    if (passes(ex.starterCode, ex)) problems.push("el código inicial ya aprueba");
    if (!ex.hint.trim()) problems.push("falta la pista");
    if (!ex.testCases.some((tc) => !tc.isHidden)) problems.push("no hay caso visible");
    if (!ex.testCases.some((tc) => tc.isHidden)) problems.push("no hay caso oculto");
    if (ex.testCases.some((tc) => !ex.compute(lines(tc.input)).trim())) problems.push("un caso espera salida vacía");
    if (problems.length) {
      failures++;
      console.error(`✗ ${ex.slug} ${ex.title}: ${problems.join("; ")}`);
    }
  }
}
console.log(`${total - failures}/${total} ejercicios OK`);
process.exitCode = failures ? 1 : 0;

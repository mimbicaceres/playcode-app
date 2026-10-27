// Verifica el curso de HTML y CSS SIN tocar la base, en un Chromium REAL (usa el
// Edge/Chrome ya instalado via puppeteer-core): renderiza cada solucion con la
// MISMA funcion que usa la app (src/lib/htmlExec.ts) y compara con el mismo
// corrector del servidor (src/lib/codeGrader.ts).
//   - la solucion de referencia y sus variantes correctas PASAN visible y oculto;
//   - los errores tipicos y el codigo inicial NO pasan.
// Si no hay navegador, indicar su ruta en la variable BROWSER_PATH.
import fs from "node:fs";
import puppeteer from "puppeteer-core";
import { gradeSubmission } from "../src/lib/codeGrader";
import { HTML_VIEWPORT, htmlExec } from "../../src/lib/htmlExec";
import { expectedOutputOf, HtmlExercise, units } from "../prisma/seeds/html-course";

const CANDIDATES = [
  process.env.BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

async function main() {
  const executablePath = CANDIDATES.find((p) => p && fs.existsSync(p));
  if (!executablePath) {
    console.error("No encontré Chrome ni Edge. Indicá la ruta con BROWSER_PATH=...");
    process.exitCode = 2;
    return;
  }
  const browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  // tsx inyecta __name() en las funciones; en la pagina hace falta un reemplazo.
  await page.evaluateOnNewDocument("window.__name = (f) => f;");
  await page.goto("about:blank");

  const fnSource = htmlExec.toString();
  const passes = async (code: string, e: HtmlExercise): Promise<boolean> => {
    const cases = [
      { checks: e.visible, isHidden: false },
      { checks: e.hidden, isHidden: true },
    ];
    const groups = cases.map((c) => c.checks.map((k) => k.query));
    const outputs = (await page.evaluate(
      `(${fnSource})(${JSON.stringify(code)}, ${JSON.stringify(groups)}, ${JSON.stringify(HTML_VIEWPORT)})`,
    )) as string[];
    const graded = gradeSubmission(
      cases.map((c, i) => ({ id: String(i), expectedOutput: expectedOutputOf(c.checks), isHidden: c.isHidden, compareMode: "dom" })),
      outputs.map((stdout, i) => ({ testCaseId: String(i), stdout, stderr: "", timedOut: false })),
    );
    if (!graded.allPassed && process.env.DEBUG_HTML) {
      for (const r of graded.results.filter((x) => !x.passed)) console.error("   esperado:", r.expectedOutput, "\n   obtenido:", r.actualOutput);
    }
    return graded.allPassed;
  };

  let failures = 0;
  let total = 0;
  for (const unit of units) {
    for (const e of unit.exercises) {
      total++;
      const problems: string[] = [];
      if (!(await passes(e.solution, e))) problems.push("la solución de referencia no pasa");
      for (const alt of e.alternatives ?? []) if (!(await passes(alt, e))) problems.push(`variante correcta NO pasa: ${alt}`);
      for (const bad of e.wrong ?? []) if (await passes(bad, e)) problems.push(`error típico PASA: ${bad}`);
      if (await passes(e.starterCode, e)) problems.push("el código inicial ya aprueba");
      if (!e.hint.trim()) problems.push("falta la pista");
      if (problems.length) {
        failures++;
        console.error(`✗ ${e.slug} ${e.title}:\n    ${problems.join("\n    ")}`);
      }
    }
  }
  await browser.close();
  console.log(`${total - failures}/${total} ejercicios OK (navegador: ${executablePath})`);
  process.exitCode = failures ? 1 : 0;
}
main();

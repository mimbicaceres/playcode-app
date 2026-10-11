// Comparacion server-side entre la salida que reporto el alumno (ejecutada en su
// navegador via Pyodide) y el expectedOutput real guardado en la base de datos.
// El cliente nunca manda un veredicto de exito: solo manda stdout/stderr crudos
// por test case, y esta funcion es la unica autoridad que decide si pasaron.

export interface TestCaseForGrading {
  id: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ReportedOutput {
  testCaseId: string;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface GradedTestCase {
  testCaseId: string;
  passed: boolean;
  isHidden: boolean;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  timedOut: boolean;
}

export interface GradeResult {
  allPassed: boolean;
  results: GradedTestCase[];
}

// Normaliza diferencias triviales de formato (saltos de linea, espacios al
// final) para no reprobar por algo que el alumno no puede controlar.
function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export function gradeSubmission(
  testCases: TestCaseForGrading[],
  outputs: ReportedOutput[],
): GradeResult {
  const outputsByTestCase = new Map(outputs.map((output) => [output.testCaseId, output]));

  const results: GradedTestCase[] = testCases.map((testCase) => {
    const reported = outputsByTestCase.get(testCase.id);
    // Si el cliente no reporto nada para este test case, se trata como no verificado.
    const timedOut = reported?.timedOut ?? true;
    const actualOutput = reported?.stdout ?? '';
    const passed = !timedOut && normalizeOutput(actualOutput) === normalizeOutput(testCase.expectedOutput);

    return {
      testCaseId: testCase.id,
      passed,
      isHidden: testCase.isHidden,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      stderr: reported?.stderr ?? '',
      timedOut,
    };
  });

  return {
    allPassed: results.length > 0 && results.every((result) => result.passed),
    results,
  };
}

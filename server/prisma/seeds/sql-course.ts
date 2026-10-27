import { SeedCourseSpec, SeedExerciseSpec, upsertCourse } from "./shared";
import { SCHEMA_HINT, SETUP_A, SETUP_B } from "./sql-data";

// Curso "SQL: consultas con SQLite": 20 ejercicios que se ejecutan en el
// navegador con sql.js (ver src/lib/sqlExec.ts) sobre la biblioteca escolar de
// sql-data.ts. El expectedOutput de cada caso se CALCULA corriendo la consulta
// de referencia (`solution`) sobre los mismos datos, con el mismo motor que usa
// el navegador, en vez de transcribirse a mano. La `solution` no se guarda en
// la base: `npm run verify:sql-course` comprueba cada ejercicio.
//
// Comparacion: rows_unordered (default: el orden de las filas no importa) o
// rows_ordered (solo cuando la consigna pide un orden). Las columnas siempre
// cuentan, asi que cada consigna dice el nombre exacto de las columnas.
//
// Idempotente: correrlo de nuevo actualiza el contenido por slug.

// Modulo sql.js ya inicializado (ver sqlExec.ts).
import { runSqlCase, SqlModule } from "../../../src/lib/sqlExec";

export interface SqlExercise {
  slug: string;
  title: string;
  prompt: string;
  // Esbozo en comentario que acompana al esquema en el codigo inicial.
  sketch: string;
  rewardXp: number;
  hint: string;
  solution: string;
  ordered?: boolean;
  // Solo para verificacion (no se guardan): variantes correctas que DEBEN pasar
  // y errores tipicos que DEBEN fallar.
  alternatives?: string[];
  wrong?: string[];
}

interface SqlUnit {
  slug: string;
  title: string;
  exercises: SqlExercise[];
}

export const COURSE = {
  slug: "sql-consultas",
  title: "SQL: consultas con SQLite",
  description:
    "Aprendé a consultar datos con SQL escribiendo consultas reales sobre una biblioteca escolar: filtros, orden, agrupaciones, JOIN y subconsultas, todo en tu navegador.",
};

// ─── Unidad 1: SELECT y columnas (10 XP) ────────────────────────────────────
const select: SqlExercise[] = [
  {
    slug: "sql-1-1",
    title: "Todos los libros",
    prompt: "Mostrá todas las columnas y todas las filas de la tabla libros.",
    sketch: "SELECT ... FROM libros;",
    rewardXp: 10,
    hint: "El asterisco (*) significa \"todas las columnas\": SELECT * FROM libros.",
    solution: "SELECT * FROM libros;",
  },
  {
    slug: "sql-1-2",
    title: "Título y autor",
    prompt: "Mostrá solamente el título y el autor de cada libro, en ese orden de columnas (titulo, autor).",
    sketch: "SELECT columna1, columna2 FROM libros;",
    rewardXp: 10,
    hint: "En vez de *, escribí los nombres de las columnas separados por coma: SELECT titulo, autor FROM libros.",
    solution: "SELECT titulo, autor FROM libros;",
  },
  {
    slug: "sql-1-3",
    title: "Alumnos con otro nombre de columna",
    prompt:
      "Mostrá el nombre de cada alumno pero con la columna llamada alumno (no nombre), seguido de su ciudad. Las columnas del resultado tienen que ser: alumno, ciudad.",
    sketch: "SELECT columna AS nuevo_nombre, ... FROM alumnos;",
    rewardXp: 10,
    hint: "AS le pone otro nombre a una columna en el resultado: SELECT nombre AS alumno, ciudad FROM alumnos.",
    solution: "SELECT nombre AS alumno, ciudad FROM alumnos;",
  },
  {
    slug: "sql-1-4",
    title: "Géneros distintos",
    prompt:
      "Hay muchos libros del mismo género. Mostrá cada género una sola vez, sin repetidos (una única columna: genero).",
    sketch: "SELECT ... genero FROM libros;",
    rewardXp: 10,
    hint: "La palabra DISTINCT, justo después de SELECT, elimina las filas repetidas.",
    solution: "SELECT DISTINCT genero FROM libros;",
    alternatives: ["SELECT genero FROM libros GROUP BY genero;"],
    wrong: ["SELECT genero FROM libros;"],
  },
];

// ─── Unidad 2: Filtros con WHERE (10 XP) ────────────────────────────────────
const where: SqlExercise[] = [
  {
    slug: "sql-2-1",
    title: "Libros de ciencia",
    prompt: "Mostrá el título y la cantidad de copias (titulo, copias) de los libros cuyo género es Ciencia.",
    sketch: "SELECT titulo, copias FROM libros WHERE ...;",
    rewardXp: 10,
    hint: "WHERE filtra las filas. Los textos van entre comillas simples: WHERE genero = 'Ciencia'.",
    solution: "SELECT titulo, copias FROM libros WHERE genero = 'Ciencia';",
    wrong: ["SELECT titulo, copias FROM libros WHERE genero = 'ciencia';"],
  },
  {
    slug: "sql-2-2",
    title: "Libros posteriores a 2010",
    prompt: "Mostrá el título y el año (titulo, anio) de los libros publicados después de 2010.",
    sketch: "SELECT titulo, anio FROM libros WHERE ...;",
    rewardXp: 10,
    hint: "Con números se usan operadores de comparación: WHERE anio > 2010 (sin comillas).",
    solution: "SELECT titulo, anio FROM libros WHERE anio > 2010;",
  },
  {
    slug: "sql-2-3",
    title: "Alumnos de Rosario en 4A o 5A",
    prompt:
      "Mostrá el nombre (nombre) de los alumnos que viven en Rosario y cursan 4A o 5A. Cuidado: los dos cursos son alternativas, pero la ciudad tiene que cumplirse siempre.",
    sketch: "SELECT nombre FROM alumnos WHERE ... AND (... OR ...);",
    rewardXp: 10,
    hint: "Poné paréntesis alrededor del OR: ciudad = 'Rosario' AND (curso = '4A' OR curso = '5A'). Sin ellos, el AND se evalúa primero.",
    solution: "SELECT nombre FROM alumnos WHERE ciudad = 'Rosario' AND (curso = '4A' OR curso = '5A');",
    wrong: ["SELECT nombre FROM alumnos WHERE ciudad = 'Rosario' AND curso = '4A' OR curso = '5A';"],
  },
  {
    slug: "sql-2-4",
    title: "Novelas y cuentos",
    prompt: "Mostrá el título y el género (titulo, genero) de los libros que son Novela o Cuento.",
    sketch: "SELECT titulo, genero FROM libros WHERE genero IN (...);",
    rewardXp: 10,
    hint: "IN te evita repetir condiciones: WHERE genero IN ('Novela', 'Cuento').",
    solution: "SELECT titulo, genero FROM libros WHERE genero IN ('Novela', 'Cuento');",
    alternatives: ["SELECT titulo, genero FROM libros WHERE genero = 'Novela' OR genero = 'Cuento';"],
  },
  {
    slug: "sql-2-5",
    title: "Títulos que empiezan con \"El\"",
    prompt:
      "Mostrá el título (titulo) de los libros cuyo título empieza con la palabra El, seguida de un espacio. Ojo: un título como \"Elogio...\" empieza con las letras El pero no con la palabra El.",
    sketch: "SELECT titulo FROM libros WHERE titulo LIKE '...';",
    rewardXp: 10,
    hint: "LIKE busca patrones: el signo % reemplaza cualquier cantidad de caracteres. Probá con 'El %' (con el espacio incluido).",
    solution: "SELECT titulo FROM libros WHERE titulo LIKE 'El %';",
    wrong: ["SELECT titulo FROM libros WHERE titulo LIKE 'El%';"],
  },
];

// ─── Unidad 3: Orden y límites (10 XP) ──────────────────────────────────────
const orden: SqlExercise[] = [
  {
    slug: "sql-3-1",
    title: "Del más nuevo al más antiguo",
    prompt:
      "Mostrá el título y el año (titulo, anio) de todos los libros, del más reciente al más antiguo. Si dos libros tienen el mismo año, ordenalos por título de la A a la Z.",
    sketch: "SELECT titulo, anio FROM libros ORDER BY ...;",
    rewardXp: 10,
    hint: "ORDER BY admite varias columnas separadas por coma, y DESC invierte el orden de la que lo lleva: ORDER BY anio DESC, titulo.",
    solution: "SELECT titulo, anio FROM libros ORDER BY anio DESC, titulo;",
    wrong: ["SELECT titulo, anio FROM libros ORDER BY anio ASC, titulo;", "SELECT titulo, anio FROM libros ORDER BY anio DESC;"],
    ordered: true,
  },
  {
    slug: "sql-3-2",
    title: "Los 3 libros con más copias",
    prompt:
      "Mostrá el título y las copias (titulo, copias) de los 3 libros que tienen más copias, de mayor a menor. Si hay empate de copias, desempatá por título de la A a la Z.",
    sketch: "SELECT titulo, copias FROM libros ORDER BY ... LIMIT ...;",
    rewardXp: 10,
    hint: "Primero ordená de mayor a menor (ORDER BY copias DESC, titulo) y después quedate con las primeras filas usando LIMIT 3.",
    solution: "SELECT titulo, copias FROM libros ORDER BY copias DESC, titulo LIMIT 3;",
    wrong: ["SELECT titulo, copias FROM libros ORDER BY copias LIMIT 3;"],
    ordered: true,
  },
  {
    slug: "sql-3-3",
    title: "Alumnos por ciudad y nombre",
    prompt:
      "Mostrá el nombre y la ciudad (nombre, ciudad) de todos los alumnos, ordenados primero por ciudad (de la A a la Z) y, dentro de cada ciudad, por nombre (de la A a la Z).",
    sketch: "SELECT nombre, ciudad FROM alumnos ORDER BY ..., ...;",
    rewardXp: 10,
    hint: "Escribí las dos columnas en el orden de prioridad: ORDER BY ciudad, nombre.",
    solution: "SELECT nombre, ciudad FROM alumnos ORDER BY ciudad, nombre;",
    ordered: true,
  },
];

// ─── Unidad 4: Agregados y agrupación (20 XP) ───────────────────────────────
const agregados: SqlExercise[] = [
  {
    slug: "sql-4-1",
    title: "Cuántos libros hay",
    prompt: "Contá cuántos libros hay en total. El resultado es una sola fila con una única columna llamada total.",
    sketch: "SELECT COUNT(...) AS total FROM libros;",
    rewardXp: 20,
    hint: "COUNT(*) cuenta filas. Ponele nombre a la columna con AS total.",
    solution: "SELECT COUNT(*) AS total FROM libros;",
  },
  {
    slug: "sql-4-2",
    title: "Promedio de copias por género",
    prompt:
      "Para cada género, mostrá el promedio de copias de sus libros. Las columnas son: genero, promedio (sin redondear).",
    sketch: "SELECT genero, AVG(...) AS promedio FROM libros GROUP BY ...;",
    rewardXp: 20,
    hint: "GROUP BY genero arma un grupo por género, y AVG(copias) calcula el promedio dentro de cada grupo.",
    solution: "SELECT genero, AVG(copias) AS promedio FROM libros GROUP BY genero;",
  },
  {
    slug: "sql-4-3",
    title: "Géneros con más de 3 libros",
    prompt:
      "Mostrá los géneros que tienen más de 3 libros, junto con esa cantidad. Las columnas son: genero, cantidad.",
    sketch: "SELECT genero, COUNT(*) AS cantidad FROM libros GROUP BY ... HAVING ...;",
    rewardXp: 20,
    hint: "WHERE filtra filas antes de agrupar; para filtrar grupos ya calculados se usa HAVING COUNT(*) > 3.",
    solution: "SELECT genero, COUNT(*) AS cantidad FROM libros GROUP BY genero HAVING COUNT(*) > 3;",
    alternatives: ["SELECT genero, COUNT(*) AS cantidad FROM libros GROUP BY genero HAVING cantidad > 3;"],
    wrong: ["SELECT genero, COUNT(*) AS cantidad FROM libros GROUP BY genero;"],
  },
  {
    slug: "sql-4-4",
    title: "El libro más viejo y el más nuevo",
    prompt:
      "En una sola fila, mostrá el año del libro más antiguo y el del más reciente. Las columnas son: mas_viejo, mas_nuevo.",
    sketch: "SELECT MIN(...) AS mas_viejo, MAX(...) AS mas_nuevo FROM libros;",
    rewardXp: 20,
    hint: "MIN(anio) devuelve el menor valor de la columna y MAX(anio) el mayor.",
    solution: "SELECT MIN(anio) AS mas_viejo, MAX(anio) AS mas_nuevo FROM libros;",
  },
];

// ─── Unidad 5: JOIN (20 XP) ─────────────────────────────────────────────────
const joins: SqlExercise[] = [
  {
    slug: "sql-5-1",
    title: "Préstamos con el nombre del alumno",
    prompt:
      "Mostrá cada préstamo con el nombre del alumno que lo pidió y la fecha. Las columnas son: alumno, fecha (alumno es el nombre del alumno).",
    sketch: "SELECT ... AS alumno, ... FROM prestamos JOIN alumnos ON ...;",
    rewardXp: 20,
    hint: "Unís las tablas por la columna que las relaciona: prestamos.alumno_id = alumnos.id. Podés darles alias cortos (FROM prestamos p JOIN alumnos a ON a.id = p.alumno_id).",
    solution:
      "SELECT a.nombre AS alumno, p.fecha FROM prestamos p JOIN alumnos a ON a.id = p.alumno_id;",
  },
  {
    slug: "sql-5-2",
    title: "Préstamos con alumno y libro",
    prompt:
      "Mostrá cada préstamo con el nombre del alumno, el título del libro y la fecha. Las columnas son: alumno, titulo, fecha.",
    sketch: "SELECT ... FROM prestamos JOIN alumnos ON ... JOIN libros ON ...;",
    rewardXp: 20,
    hint: "Podés encadenar dos JOIN: uno hacia alumnos (por alumno_id) y otro hacia libros (por libro_id).",
    solution:
      "SELECT a.nombre AS alumno, l.titulo, p.fecha FROM prestamos p JOIN alumnos a ON a.id = p.alumno_id JOIN libros l ON l.id = p.libro_id;",
  },
  {
    slug: "sql-5-3",
    title: "Alumnos que nunca pidieron un libro",
    prompt:
      "Mostrá el nombre (nombre) de los alumnos que no tienen ningún préstamo. Pensalo así: unís alumnos con préstamos conservando a todos los alumnos, y te quedás con los que no encontraron pareja.",
    sketch: "SELECT nombre FROM alumnos LEFT JOIN prestamos ON ... WHERE ... IS NULL;",
    rewardXp: 20,
    hint: "LEFT JOIN conserva todos los alumnos; los que no tienen préstamos quedan con las columnas de prestamos en NULL. Filtrá con WHERE p.id IS NULL.",
    solution:
      "SELECT a.nombre FROM alumnos a LEFT JOIN prestamos p ON p.alumno_id = a.id WHERE p.id IS NULL;",
    alternatives: [
      "SELECT nombre FROM alumnos WHERE id NOT IN (SELECT alumno_id FROM prestamos);",
      "SELECT nombre FROM alumnos a WHERE NOT EXISTS (SELECT 1 FROM prestamos p WHERE p.alumno_id = a.id);",
    ],
    wrong: ["SELECT a.nombre FROM alumnos a JOIN prestamos p ON p.alumno_id = a.id;"],
  },
];

// ─── Unidad 6: Subconsultas (20 XP) ─────────────────────────────────────────
const subconsultas: SqlExercise[] = [
  {
    slug: "sql-6-1",
    title: "Libros con más copias que el promedio",
    prompt:
      "Mostrá el título y las copias (titulo, copias) de los libros que tienen más copias que el promedio de copias de todos los libros.",
    sketch: "SELECT titulo, copias FROM libros WHERE copias > (SELECT ... );",
    rewardXp: 20,
    hint: "Una consulta puede ir entre paréntesis dentro del WHERE: WHERE copias > (SELECT AVG(copias) FROM libros).",
    solution: "SELECT titulo, copias FROM libros WHERE copias > (SELECT AVG(copias) FROM libros);",
    wrong: ["SELECT titulo, copias FROM libros WHERE copias > 4;"],
  },
];

export const units: SqlUnit[] = [
  { slug: "sql-consultas-u1-select", title: "SELECT y columnas", exercises: select },
  { slug: "sql-consultas-u2-where", title: "Filtros con WHERE", exercises: where },
  { slug: "sql-consultas-u3-orden", title: "Orden y límites", exercises: orden },
  { slug: "sql-consultas-u4-agregados", title: "Agregados y agrupación", exercises: agregados },
  { slug: "sql-consultas-u5-join", title: "JOIN", exercises: joins },
  { slug: "sql-consultas-u6-subconsultas", title: "Subconsultas", exercises: subconsultas },
];

export const starterCodeOf = (e: SqlExercise) => `${SCHEMA_HINT}--\n-- ${e.sketch}\n\n`;

// Casos de cada ejercicio: el visible usa los datos A y el oculto los B.
export const casesOf = (e: SqlExercise) =>
  [
    { setup: SETUP_A, isHidden: false },
    { setup: SETUP_B, isHidden: true },
  ].map((c) => ({ ...c, mode: e.ordered ? "rows_ordered" : "rows_unordered" }));

// Resultado de la consulta de referencia sobre cada conjunto de datos.
export function referenceOutput(SQL: SqlModule, e: SqlExercise, setup: string): string {
  const result = runSqlCase(SQL, e.solution, setup);
  if (result.stderr) throw new Error(`${e.slug}: la solución de referencia falla: ${result.stderr}`);
  return result.stdout;
}

export async function seedSqlCourse() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQL = (await require("sql.js")()) as SqlModule;

  const toSpec = (e: SqlExercise): SeedExerciseSpec => ({
    slug: e.slug,
    title: e.title,
    prompt: e.prompt,
    starterCode: starterCodeOf(e),
    rewardXp: e.rewardXp,
    hint: e.hint,
    testCases: casesOf(e).map((c) => ({
      input: null,
      expectedOutput: referenceOutput(SQL, e, c.setup),
      isHidden: c.isHidden,
      compareMode: c.mode,
      spec: { setup: c.setup },
    })),
  });
  const spec: SeedCourseSpec = {
    ...COURSE,
    language: "sql",
    units: units.map((u) => ({ slug: u.slug, title: u.title, exercises: u.exercises.map(toSpec) })),
  };
  await upsertCourse(spec);
  console.log("Seed del curso de SQL completado.");
}

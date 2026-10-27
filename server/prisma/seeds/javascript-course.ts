import { SeedCourseSpec, SeedExerciseSpec, upsertCourse } from "./shared";

// Curso "JavaScript — Fundamentos": 21 ejercicios que se ejecutan en el
// navegador (ver src/lib/jsExec.ts). El alumno lee con input() y escribe con
// console.log. Como en el curso de Python, el expectedOutput se CALCULA con la
// funcion `compute` de referencia y no se transcribe a mano. Ademas cada
// ejercicio trae una `solution` de referencia que NO se guarda en la base: el
// script `npm run verify:js-course` la corre con el mismo motor que usa el
// navegador y comprueba que pasa todos los casos.
//
// Idempotente: correrlo de nuevo actualiza el contenido por slug.

interface JsExercise {
  slug: string;
  title: string;
  prompt: string;
  starterCode: string;
  rewardXp: number;
  hint: string;
  solution: string;
  compute: (lines: string[]) => string;
  testCases: { input: string; isHidden: boolean }[];
}

interface JsUnit {
  slug: string;
  title: string;
  exercises: JsExercise[];
}

export const COURSE = {
  slug: "javascript-fundamentos",
  title: "JavaScript — Fundamentos",
  description:
    "Aprendé JavaScript escribiendo programas cortos que corren en tu navegador: variables, condicionales, bucles, funciones, arrays y objetos.",
};

const nums = (ls: string[]) => ls.map(Number);
const words = (line: string) => line.split(" ").filter((w) => w.length > 0);

// ─── Unidad 1: Variables y operadores (10 XP) ───────────────────────────────
const variables: JsExercise[] = [
  {
    slug: "js-1-1",
    title: "Saludo con nombre",
    prompt:
      "Leé un nombre con input() y mostrá un saludo con el formato Hola, NOMBRE! (con la coma y el signo de exclamación). Por ejemplo, si el nombre es Ana, tu programa tiene que mostrar: Hola, Ana!",
    starterCode: "const nombre = input();\n// mostrá el saludo con console.log\n",
    rewardXp: 10,
    hint: "Podés armar el texto con una plantilla: `Hola, ${nombre}!` (con comillas invertidas).",
    solution: "const nombre = input();\nconsole.log(`Hola, ${nombre}!`);",
    compute: (ls) => `Hola, ${ls[0]}!`,
    testCases: [
      { input: "Ana", isHidden: false },
      { input: "Tomás", isHidden: true },
    ],
  },
  {
    slug: "js-1-2",
    title: "Suma de dos números",
    prompt:
      "Leé dos números (uno por línea, con input()) y mostrá cuánto da sumarlos. Tené en cuenta que input() devuelve texto: convertilo a número antes de sumar, si no JavaScript va a pegar los textos en vez de sumarlos.",
    starterCode: "const a = Number(input());\nconst b = Number(input());\n// mostrá la suma\n",
    rewardXp: 10,
    hint: "Con Number() ya tenés los dos valores como números; alcanza con mostrar a + b.",
    solution: "const a = Number(input());\nconst b = Number(input());\nconsole.log(a + b);",
    compute: (ls) => String(Number(ls[0]) + Number(ls[1])),
    testCases: [
      { input: "3\n4", isHidden: false },
      { input: "-5\n12", isHidden: true },
      { input: "2.5\n0.5", isHidden: true },
    ],
  },
  {
    slug: "js-1-3",
    title: "Área de un rectángulo",
    prompt:
      "Un rectángulo tiene una base y una altura. Leé primero la base y después la altura (con input()) y mostrá su área.",
    starterCode: "const base = Number(input());\nconst altura = Number(input());\n// calculá y mostrá el área\n",
    rewardXp: 10,
    hint: "El área de un rectángulo es la base multiplicada por la altura.",
    solution: "const base = Number(input());\nconst altura = Number(input());\nconsole.log(base * altura);",
    compute: (ls) => String(Number(ls[0]) * Number(ls[1])),
    testCases: [
      { input: "5\n3", isHidden: false },
      { input: "7\n2", isHidden: true },
      { input: "1.5\n4", isHidden: true },
    ],
  },
  {
    slug: "js-1-4",
    title: "De Celsius a Fahrenheit",
    prompt:
      "Leé una temperatura en grados Celsius y mostrala en grados Fahrenheit con un decimal. La conversión es: Fahrenheit = Celsius × 9 / 5 + 32. Para mostrar un solo decimal usá el método .toFixed(1).",
    starterCode: "const celsius = Number(input());\n// convertí y mostrá con un decimal\n",
    rewardXp: 10,
    hint: "Primero calculá celsius * 9 / 5 + 32 y después mostralo con .toFixed(1) para que tenga un solo decimal.",
    solution: "const celsius = Number(input());\nconsole.log((celsius * 9 / 5 + 32).toFixed(1));",
    compute: (ls) => ((Number(ls[0]) * 9) / 5 + 32).toFixed(1),
    testCases: [
      { input: "100", isHidden: false },
      { input: "37", isHidden: true },
      { input: "-10", isHidden: true },
    ],
  },
  {
    slug: "js-1-5",
    title: "Cociente y resto",
    prompt:
      "Leé dos números enteros positivos: el dividendo y el divisor (en ese orden). Mostrá, en dos líneas, primero el cociente entero de la división y después el resto.",
    starterCode:
      "const dividendo = Number(input());\nconst divisor = Number(input());\n// mostrá el cociente entero y, en otra línea, el resto\n",
    rewardXp: 10,
    hint: "Para el cociente entero usá Math.floor(dividendo / divisor); para el resto, el operador %.",
    solution:
      "const dividendo = Number(input());\nconst divisor = Number(input());\nconsole.log(Math.floor(dividendo / divisor));\nconsole.log(dividendo % divisor);",
    compute: (ls) => {
      const [a, b] = nums(ls);
      return `${Math.floor(a / b)}\n${a % b}`;
    },
    testCases: [
      { input: "17\n5", isHidden: false },
      { input: "20\n4", isHidden: true },
      { input: "3\n8", isHidden: true },
    ],
  },
];

// ─── Unidad 2: Condicionales (10 XP) ────────────────────────────────────────
const condicionales: JsExercise[] = [
  {
    slug: "js-2-1",
    title: "Par o impar",
    prompt: "Leé un número entero y mostrá la palabra par si es par, o impar si no lo es.",
    starterCode: "const n = Number(input());\n// mostrá par o impar\n",
    rewardXp: 10,
    hint: "Un número es par cuando el resto de dividirlo por 2 da 0: n % 2 === 0.",
    solution: "const n = Number(input());\nif (n % 2 === 0) {\n  console.log('par');\n} else {\n  console.log('impar');\n}",
    compute: (ls) => (Number(ls[0]) % 2 === 0 ? "par" : "impar"),
    testCases: [
      { input: "4", isHidden: false },
      { input: "7", isHidden: true },
      { input: "0", isHidden: true },
    ],
  },
  {
    slug: "js-2-2",
    title: "El mayor de dos números",
    prompt:
      "Leé dos números y mostrá el mayor de los dos. Si son iguales, mostrá la palabra iguales.",
    starterCode: "const a = Number(input());\nconst b = Number(input());\n// compará y mostrá el resultado\n",
    rewardXp: 10,
    hint: "Necesitás tres caminos: a > b, b > a, y el que queda (son iguales). Podés usar if, else if y else.",
    solution:
      "const a = Number(input());\nconst b = Number(input());\nif (a > b) {\n  console.log(a);\n} else if (b > a) {\n  console.log(b);\n} else {\n  console.log('iguales');\n}",
    compute: (ls) => {
      const [a, b] = nums(ls);
      return a === b ? "iguales" : String(Math.max(a, b));
    },
    testCases: [
      { input: "8\n3", isHidden: false },
      { input: "2\n9", isHidden: true },
      { input: "5\n5", isHidden: true },
    ],
  },
  {
    slug: "js-2-3",
    title: "Aprobado o desaprobado",
    prompt:
      "Leé la nota de un examen (de 0 a 10). Si la nota es 6 o más, mostrá aprobado; si es menor a 6, mostrá desaprobado.",
    starterCode: "const nota = Number(input());\n// decidí si aprobó\n",
    rewardXp: 10,
    hint: "Fijate bien el límite: con un 6 justo el alumno aprueba, así que la condición es nota >= 6.",
    solution: "const nota = Number(input());\nconsole.log(nota >= 6 ? 'aprobado' : 'desaprobado');",
    compute: (ls) => (Number(ls[0]) >= 6 ? "aprobado" : "desaprobado"),
    testCases: [
      { input: "8", isHidden: false },
      { input: "4", isHidden: true },
      { input: "6", isHidden: true },
    ],
  },
  {
    slug: "js-2-4",
    title: "Año bisiesto",
    prompt:
      "Leé un año y mostrá bisiesto o no bisiesto. Un año es bisiesto si es divisible por 4, salvo que sea divisible por 100; pero los divisibles por 400 sí son bisiestos (por ejemplo, 1900 no lo fue y 2000 sí).",
    starterCode: "const anio = Number(input());\n// decidí si es bisiesto\n",
    rewardXp: 10,
    hint: "Combiná las condiciones con && y ||: (divisible por 4 y no por 100) o divisible por 400.",
    solution:
      "const anio = Number(input());\nconst esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;\nconsole.log(esBisiesto ? 'bisiesto' : 'no bisiesto');",
    compute: (ls) => {
      const y = Number(ls[0]);
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? "bisiesto" : "no bisiesto";
    },
    testCases: [
      { input: "2024", isHidden: false },
      { input: "1900", isHidden: true },
      { input: "2000", isHidden: true },
      { input: "2023", isHidden: true },
    ],
  },
  {
    slug: "js-2-5",
    title: "Tipo de triángulo",
    prompt:
      "Leé los tres lados de un triángulo (uno por línea). Mostrá equilátero si los tres lados son iguales, isósceles si solo dos son iguales, o escaleno si los tres son distintos.",
    starterCode: "const a = Number(input());\nconst b = Number(input());\nconst c = Number(input());\n// clasificá el triángulo\n",
    rewardXp: 10,
    hint: "Empezá por el caso más especial (los tres iguales); después preguntá si hay al menos dos iguales; si no, es escaleno.",
    solution:
      "const a = Number(input());\nconst b = Number(input());\nconst c = Number(input());\nif (a === b && b === c) {\n  console.log('equilátero');\n} else if (a === b || b === c || a === c) {\n  console.log('isósceles');\n} else {\n  console.log('escaleno');\n}",
    compute: (ls) => {
      const [a, b, c] = nums(ls);
      if (a === b && b === c) return "equilátero";
      if (a === b || b === c || a === c) return "isósceles";
      return "escaleno";
    },
    testCases: [
      { input: "3\n3\n3", isHidden: false },
      { input: "3\n3\n5", isHidden: true },
      { input: "3\n4\n5", isHidden: true },
      { input: "6\n2\n6", isHidden: true },
    ],
  },
];

// ─── Unidad 3: Bucles (20 XP) ───────────────────────────────────────────────
const bucles: JsExercise[] = [
  {
    slug: "js-3-1",
    title: "Contar hasta n",
    prompt: "Leé un número entero n y mostrá los números del 1 al n, uno por línea.",
    starterCode: "const n = Number(input());\n// mostrá del 1 al n\n",
    rewardXp: 20,
    hint: "Un for que arranque en 1 y termine cuando i sea mayor que n: for (let i = 1; i <= n; i++).",
    solution: "const n = Number(input());\nfor (let i = 1; i <= n; i++) {\n  console.log(i);\n}",
    compute: (ls) => Array.from({ length: Number(ls[0]) }, (_, i) => String(i + 1)).join("\n"),
    testCases: [
      { input: "5", isHidden: false },
      { input: "1", isHidden: true },
      { input: "8", isHidden: true },
    ],
  },
  {
    slug: "js-3-2",
    title: "Suma de los pares",
    prompt:
      "Leé un número entero n y mostrá la suma de todos los números pares que hay entre 1 y n (incluyendo a n si es par). Si no hay ninguno, la suma es 0.",
    starterCode: "const n = Number(input());\nlet total = 0;\n// recorré los números y acumulá los pares\nconsole.log(total);\n",
    rewardXp: 20,
    hint: "Recorré de 1 a n con un for y sumá a total solamente cuando i % 2 === 0.",
    solution:
      "const n = Number(input());\nlet total = 0;\nfor (let i = 1; i <= n; i++) {\n  if (i % 2 === 0) total += i;\n}\nconsole.log(total);",
    compute: (ls) => {
      let total = 0;
      for (let i = 1; i <= Number(ls[0]); i++) if (i % 2 === 0) total += i;
      return String(total);
    },
    testCases: [
      { input: "10", isHidden: false },
      { input: "1", isHidden: true },
      { input: "15", isHidden: true },
    ],
  },
  {
    slug: "js-3-3",
    title: "Tabla de multiplicar",
    prompt:
      "Leé un número n y mostrá su tabla del 1 al 10, una multiplicación por línea, con este formato: n x i = resultado. Por ejemplo, para n = 3 la primera línea es 3 x 1 = 3.",
    starterCode: "const n = Number(input());\n// mostrá las 10 líneas de la tabla\n",
    rewardXp: 20,
    hint: "Usá un for de 1 a 10 y armá cada línea con una plantilla: `${n} x ${i} = ${n * i}`.",
    solution: "const n = Number(input());\nfor (let i = 1; i <= 10; i++) {\n  console.log(`${n} x ${i} = ${n * i}`);\n}",
    compute: (ls) => {
      const n = Number(ls[0]);
      return Array.from({ length: 10 }, (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`).join("\n");
    },
    testCases: [
      { input: "3", isHidden: false },
      { input: "7", isHidden: true },
    ],
  },
  {
    slug: "js-3-4",
    title: "Factorial",
    prompt:
      "El factorial de un número n (se escribe n!) es el producto de todos los enteros del 1 al n. Por ejemplo, 5! = 1 × 2 × 3 × 4 × 5 = 120. Leé un número n (entre 0 y 15) y mostrá su factorial. Recordá que 0! vale 1.",
    starterCode: "const n = Number(input());\nlet resultado = 1;\n// multiplicá del 1 al n\nconsole.log(resultado);\n",
    rewardXp: 20,
    hint: "Empezá con resultado = 1 y, dentro de un for de 1 a n, hacé resultado *= i. Para n = 0 el bucle no entra y queda el 1.",
    solution: "const n = Number(input());\nlet resultado = 1;\nfor (let i = 1; i <= n; i++) {\n  resultado *= i;\n}\nconsole.log(resultado);",
    compute: (ls) => {
      let r = 1;
      for (let i = 1; i <= Number(ls[0]); i++) r *= i;
      return String(r);
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "0", isHidden: true },
      { input: "10", isHidden: true },
      { input: "15", isHidden: true },
    ],
  },
  {
    slug: "js-3-5",
    title: "Cuántos dígitos tiene",
    prompt:
      "Leé un número entero positivo y mostrá cuántos dígitos tiene. Por ejemplo, 12345 tiene 5 dígitos. Pensalo con un bucle: ¿cuántas veces podés dividirlo por 10 hasta llegar a 0?",
    starterCode: "let n = Number(input());\nlet cantidad = 0;\n// contá los dígitos\nconsole.log(cantidad);\n",
    rewardXp: 20,
    hint: "Mientras n sea mayor que 0: dividilo por 10 (con Math.floor) y sumá 1 a cantidad.",
    solution: "let n = Number(input());\nlet cantidad = 0;\nwhile (n > 0) {\n  n = Math.floor(n / 10);\n  cantidad++;\n}\nconsole.log(cantidad);",
    compute: (ls) => String(ls[0].length),
    testCases: [
      { input: "12345", isHidden: false },
      { input: "7", isHidden: true },
      { input: "1000000", isHidden: true },
    ],
  },
];

// ─── Unidad 4: Funciones (20 XP) ────────────────────────────────────────────
const funciones: JsExercise[] = [
  {
    slug: "js-4-1",
    title: "Función esPrimo",
    prompt:
      "Completá la función esPrimo(n), que devuelve true si n es un número primo (solo es divisible por 1 y por sí mismo) y false si no. Recordá que el 1 no es primo. El programa ya lee el número y muestra primo o no primo usando tu función.",
    starterCode:
      "function esPrimo(n) {\n  // completá la función\n}\n\nconst n = Number(input());\nconsole.log(esPrimo(n) ? 'primo' : 'no primo');\n",
    rewardXp: 20,
    hint: "Si n < 2 devolvé false. Después probá dividir por cada número de 2 a n - 1: si alguna división da resto 0, no es primo.",
    solution:
      "function esPrimo(n) {\n  if (n < 2) return false;\n  for (let i = 2; i < n; i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\n\nconst n = Number(input());\nconsole.log(esPrimo(n) ? 'primo' : 'no primo');",
    compute: (ls) => {
      const n = Number(ls[0]);
      if (n < 2) return "no primo";
      for (let i = 2; i < n; i++) if (n % i === 0) return "no primo";
      return "primo";
    },
    testCases: [
      { input: "7", isHidden: false },
      { input: "1", isHidden: true },
      { input: "15", isHidden: true },
      { input: "2", isHidden: true },
      { input: "29", isHidden: true },
    ],
  },
  {
    slug: "js-4-2",
    title: "Función invertirTexto",
    prompt:
      "Completá la función invertirTexto(texto), que devuelve el mismo texto pero escrito al revés (por ejemplo, hola pasa a ser aloh). El programa ya lee una palabra y muestra lo que devuelve tu función.",
    starterCode:
      "function invertirTexto(texto) {\n  // completá la función\n}\n\nconsole.log(invertirTexto(input()));\n",
    rewardXp: 20,
    hint: "Podés recorrer el texto de atrás para adelante y juntar las letras, o convertirlo en array con split(''), darlo vuelta con reverse() y volver a unirlo con join('').",
    solution:
      "function invertirTexto(texto) {\n  return texto.split('').reverse().join('');\n}\n\nconsole.log(invertirTexto(input()));",
    compute: (ls) => ls[0].split("").reverse().join(""),
    testCases: [
      { input: "hola", isHidden: false },
      { input: "reconocer", isHidden: true },
      { input: "JavaScript", isHidden: true },
    ],
  },
];

// ─── Unidad 5: Arrays (20 XP) ───────────────────────────────────────────────
const arrays: JsExercise[] = [
  {
    slug: "js-5-1",
    title: "Promedio de una lista",
    prompt:
      "Leé una línea con números separados por espacios (por ejemplo: 4 8 15). Mostrá el promedio de todos ellos con dos decimales (con .toFixed(2)).",
    starterCode: "const numeros = input().split(' ').map(Number);\n// calculá y mostrá el promedio\n",
    rewardXp: 20,
    hint: "Sumá todos los elementos (con un for o con reduce) y dividí por numeros.length.",
    solution:
      "const numeros = input().split(' ').map(Number);\nlet suma = 0;\nfor (const x of numeros) suma += x;\nconsole.log((suma / numeros.length).toFixed(2));",
    compute: (ls) => {
      const xs = words(ls[0]).map(Number);
      return (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
    },
    testCases: [
      { input: "4 8 15 16 23 42", isHidden: false },
      { input: "10 20", isHidden: true },
      { input: "7", isHidden: true },
    ],
  },
  {
    slug: "js-5-2",
    title: "Mayor y menor",
    prompt:
      "Leé una línea con números separados por espacios. Mostrá en dos líneas el mayor y el menor, con este formato:\nMayor: X\nMenor: Y",
    starterCode: "const numeros = input().split(' ').map(Number);\n// mostrá el mayor y el menor\n",
    rewardXp: 20,
    hint: "Math.max(...numeros) y Math.min(...numeros) te dan los dos valores sin necesidad de un bucle.",
    solution:
      "const numeros = input().split(' ').map(Number);\nconsole.log(`Mayor: ${Math.max(...numeros)}`);\nconsole.log(`Menor: ${Math.min(...numeros)}`);",
    compute: (ls) => {
      const xs = words(ls[0]).map(Number);
      return `Mayor: ${Math.max(...xs)}\nMenor: ${Math.min(...xs)}`;
    },
    testCases: [
      { input: "3 9 -2 7", isHidden: false },
      { input: "5", isHidden: true },
      { input: "-4 -9 -1 -7", isHidden: true },
    ],
  },
  {
    slug: "js-5-3",
    title: "Solo los positivos",
    prompt:
      "Leé una línea con números separados por espacios y mostrá, en una sola línea y separados por espacios, los que son positivos (mayores que 0), respetando el orden original. Si no hay ninguno, mostrá la palabra ninguno.",
    starterCode: "const numeros = input().split(' ').map(Number);\n// filtrá los positivos y mostralos\n",
    rewardXp: 20,
    hint: "numeros.filter(x => x > 0) te devuelve un array con los positivos. Para mostrarlos separados por espacios usá .join(' ').",
    solution:
      "const numeros = input().split(' ').map(Number);\nconst positivos = numeros.filter((x) => x > 0);\nconsole.log(positivos.length > 0 ? positivos.join(' ') : 'ninguno');",
    compute: (ls) => {
      const pos = words(ls[0]).map(Number).filter((x) => x > 0);
      return pos.length > 0 ? pos.join(" ") : "ninguno";
    },
    testCases: [
      { input: "3 -1 4 -5 9", isHidden: false },
      { input: "-2 -8", isHidden: true },
      { input: "0 5 -3", isHidden: true },
    ],
  },
];

// ─── Unidad 6: Objetos (20 XP) ──────────────────────────────────────────────
const objetos: JsExercise[] = [
  {
    slug: "js-6-1",
    title: "Contar palabras",
    prompt:
      "Leé una línea con palabras separadas por espacios. Contá cuántas veces aparece cada palabra y mostrá una línea por cada palabra distinta con el formato palabra: cantidad, en el orden en que aparecen por primera vez. Por ejemplo, para hola mundo hola se muestra hola: 2 y luego mundo: 1.",
    starterCode: "const palabras = input().split(' ');\nconst conteo = {};\n// llená el objeto conteo y mostrá el resultado\n",
    rewardXp: 20,
    hint: "Recorré las palabras: si conteo[palabra] todavía no existe, ponelo en 0, y después sumale 1. Al final recorré las claves con Object.keys(conteo).",
    solution:
      "const palabras = input().split(' ');\nconst conteo = {};\nfor (const palabra of palabras) {\n  conteo[palabra] = (conteo[palabra] || 0) + 1;\n}\nfor (const palabra of Object.keys(conteo)) {\n  console.log(`${palabra}: ${conteo[palabra]}`);\n}",
    compute: (ls) => {
      const conteo = new Map<string, number>();
      for (const w of words(ls[0])) conteo.set(w, (conteo.get(w) ?? 0) + 1);
      return [...conteo].map(([w, n]) => `${w}: ${n}`).join("\n");
    },
    testCases: [
      { input: "hola mundo hola", isHidden: false },
      { input: "uno dos tres dos uno dos", isHidden: true },
      { input: "sol", isHidden: true },
    ],
  },
];

export const units: JsUnit[] = [
  { slug: "javascript-fundamentos-u1-variables", title: "Variables y operadores", exercises: variables },
  { slug: "javascript-fundamentos-u2-condicionales", title: "Condicionales", exercises: condicionales },
  { slug: "javascript-fundamentos-u3-bucles", title: "Bucles", exercises: bucles },
  { slug: "javascript-fundamentos-u4-funciones", title: "Funciones", exercises: funciones },
  { slug: "javascript-fundamentos-u5-arrays", title: "Arrays", exercises: arrays },
  { slug: "javascript-fundamentos-u6-objetos", title: "Objetos", exercises: objetos },
];

const lines = (s: string) => (s.length > 0 ? s.split("\n") : []);

export async function seedJavascriptCourse() {
  const toSpec = (e: JsExercise): SeedExerciseSpec => ({
    slug: e.slug,
    title: e.title,
    prompt: e.prompt,
    starterCode: e.starterCode,
    rewardXp: e.rewardXp,
    hint: e.hint,
    testCases: e.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: e.compute(lines(tc.input)),
      isHidden: tc.isHidden,
    })),
  });
  const spec: SeedCourseSpec = {
    ...COURSE,
    language: "javascript",
    units: units.map((u) => ({ slug: u.slug, title: u.title, exercises: u.exercises.map(toSpec) })),
  };
  await upsertCourse(spec);
  console.log("Seed del curso de JavaScript completado.");
}

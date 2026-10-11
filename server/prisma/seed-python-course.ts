import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Seed del curso "Python — Fundamentos": 48 ejercicios adaptados de
// https://aed-frre.github.io/practica/1.1/ y .../1.2/, reescritos en
// castellano y orientados a Python. El expectedOutput de cada test case se
// CALCULA con la funcion `compute` de referencia (en TypeScript) en vez de
// transcribirse a mano, para evitar errores de tipeo en 48 ejercicios.
//
// Idempotente: correrlo de nuevo actualiza el contenido existente (por slug)
// en vez de duplicarlo.

interface SeedTestCase {
  input: string;
  isHidden: boolean;
}

interface SeedExercise {
  slug: string;
  title: string;
  prompt: string;
  starterCode: string;
  rewardXp: number;
  hint?: string;
  compute: (lines: string[]) => string;
  testCases: SeedTestCase[];
}

interface SeedUnit {
  slug: string;
  title: string;
  exercises: SeedExercise[];
}

const COURSE = {
  slug: "python-fundamentos",
  title: "Python — Fundamentos",
  description:
    "Ejercicios de algoritmos y estructuras de datos (basados en la practica de AED - UTN FRRE), reescritos y orientados a Python.",
};

const lines = (s: string) => (s.length > 0 ? s.split("\n") : []);
const nums = (s: string) => lines(s).map(Number);

// ─────────────────────────────────────────────────────────────────────────
// Unidad 1: Estructuras Secuenciales (1.1.5.1 a 1.1.5.7)
// ─────────────────────────────────────────────────────────────────────────
const secuenciales: SeedExercise[] = [
  {
    slug: "py-1-1-5-1",
    title: "1.1.5.1 — Precio con inflación",
    prompt:
      'Un artículo cuesta cierto precio hoy. Dado el precio actual, un porcentaje de inflación anual, y una cantidad de años, calculá cuánto va a costar el artículo al final de esos años (aplicando la inflación compuesta cada año). Leé los tres valores con input(), en este orden: precio actual, porcentaje de inflación anual, y cantidad de años. Imprimí el precio final con 2 decimales (podés usar print(f"{valor:.2f}")).',
    starterCode: "precio = float(input())\nporcentaje = float(input())\nanios = int(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [precio, porcentaje, anios] = ls.map(Number);
      return (precio * Math.pow(1 + porcentaje / 100, anios)).toFixed(2);
    },
    testCases: [
      { input: "100\n10\n2", isHidden: false },
      { input: "250\n5\n3", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-2",
    title: "1.1.5.2 — Discriminante de una ecuación de segundo grado",
    prompt:
      "Leé los tres coeficientes a, b y c de una ecuación cuadrática ax² + bx + c = 0 (en ese orden, con input()) y calculá su discriminante (b² - 4ac). Imprimí el resultado.",
    starterCode: "a = int(input())\nb = int(input())\nc = int(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [a, b, c] = ls.map(Number);
      return String(b * b - 4 * a * c);
    },
    testCases: [
      { input: "1\n-3\n2", isHidden: false },
      { input: "2\n4\n-6", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-3",
    title: "1.1.5.3 — Precio total de PC e impresora con ganancias e IVA",
    prompt:
      "Una tienda vende una PC y una impresora juntas. Leé (con input(), en este orden): el precio de costo de la PC, el precio de costo de la impresora, el porcentaje de ganancia que se les agrega, y el porcentaje de IVA que se aplica al final. Calculá el precio total de venta (primero aplicá la ganancia sobre la suma de ambos costos, y después el IVA sobre ese subtotal) e imprimilo con 2 decimales.",
    starterCode:
      "pc = float(input())\nimpresora = float(input())\nganancia = float(input())\niva = float(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [pc, imp, gan, iva] = ls.map(Number);
      const subtotal = (pc + imp) * (1 + gan / 100);
      return (subtotal * (1 + iva / 100)).toFixed(2);
    },
    testCases: [
      { input: "1000\n200\n20\n21", isHidden: false },
      { input: "500\n150\n10\n21", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-4",
    title: "1.1.5.4 — Superficie de un trapecio",
    prompt:
      "Leé la base mayor, la base menor y la altura de un trapecio (en ese orden, con input()) y calculá su superficie: (base_mayor + base_menor) * altura / 2. Imprimí el resultado con 2 decimales.",
    starterCode: "base_mayor = float(input())\nbase_menor = float(input())\naltura = float(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [B, b, h] = ls.map(Number);
      return (((B + b) * h) / 2).toFixed(2);
    },
    testCases: [
      { input: "10\n6\n4", isHidden: false },
      { input: "7.5\n4.5\n3", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-5",
    title: "1.1.5.5 — Sección de un conductor con incremento de seguridad",
    prompt:
      "En una instalación eléctrica se calculó la sección base de un conductor. Por seguridad, hay que incrementarla en un porcentaje dado. Leé (con input()) la sección base y el porcentaje de incremento de seguridad, y calculá la sección final: base * (1 + porcentaje/100). Imprimí el resultado con 2 decimales.",
    starterCode: "seccion_base = float(input())\nporcentaje = float(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [base, pct] = ls.map(Number);
      return (base * (1 + pct / 100)).toFixed(2);
    },
    testCases: [
      { input: "10\n20", isHidden: false },
      { input: "15.5\n14", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-6",
    title: "1.1.5.6 — Producto de dos números complejos",
    prompt:
      "Leé las partes real e imaginaria de dos números complejos (a+bi) y (c+di): primero a, luego b, luego c, luego d (enteros, con input()). Calculá su producto (a+bi)*(c+di) = (ac-bd) + (ad+bc)i, e imprimí la parte real y la parte imaginaria separadas por un espacio. Por ejemplo, si el resultado es 11 + 10i, imprimís: 11 10",
    starterCode: "a = int(input())\nb = int(input())\nc = int(input())\nd = int(input())\n# completa el calculo\n",
    rewardXp: 15,
    compute: (ls) => {
      const [a, b, c, d] = ls.map(Number);
      return `${a * c - b * d} ${a * d + b * c}`;
    },
    testCases: [
      { input: "2\n3\n4\n-1", isHidden: false },
      { input: "1\n0\n0\n1", isHidden: true },
    ],
  },
  {
    slug: "py-1-1-5-7",
    title: "1.1.5.7 — Media geométrica de tres valores",
    prompt:
      "Leé tres valores positivos (con input(), de a uno) y calculá su media geométrica: la raíz cúbica del producto de los tres. Imprimí el resultado con 2 decimales.",
    starterCode: "a = float(input())\nb = float(input())\nc = float(input())\n# completa el calculo\n",
    rewardXp: 15,
    compute: (ls) => {
      const [a, b, c] = ls.map(Number);
      return Math.pow(a * b * c, 1 / 3).toFixed(2);
    },
    testCases: [
      { input: "2\n4\n8", isHidden: false },
      { input: "3\n5\n7", isHidden: true },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Unidad 2: Condicionales y repetitivas (1.7 a 1.36)
// ─────────────────────────────────────────────────────────────────────────
const condicionales: SeedExercise[] = [
  {
    slug: "py-1-7",
    title: "1.7 — Mayor, medio y menor de tres valores",
    prompt:
      "Leé tres números enteros (con input(), de a uno) e imprimilos ordenados de mayor a menor, separados por un espacio. Por ejemplo, si leíste 5, 9 y 2, imprimís: 9 5 2",
    starterCode: "a = int(input())\nb = int(input())\nc = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => nums(ls.join("\n")).sort((a, b) => b - a).join(" "),
    testCases: [
      { input: "5\n9\n2", isHidden: false },
      { input: "10\n1\n7", isHidden: true },
    ],
  },
  {
    slug: "py-1-8",
    title: "1.8 — Mensaje según la suma de dos números",
    prompt:
      "Leé dos números (con input()) y calculá su suma. Imprimí 'positiva' si la suma es mayor a 0, 'negativa' si es menor a 0, o 'nula' si es igual a 0.",
    starterCode: "a = float(input())\nb = float(input())\n# completa la logica\n",
    rewardXp: 10,
    compute: (ls) => {
      const [a, b] = ls.map(Number);
      const s = a + b;
      return s > 0 ? "positiva" : s < 0 ? "negativa" : "nula";
    },
    testCases: [
      { input: "3\n5", isHidden: false },
      { input: "-2\n-5", isHidden: true },
      { input: "4\n-4", isHidden: true },
    ],
  },
  {
    slug: "py-1-9",
    title: "1.9 — Edad a partir de fecha de nacimiento y fecha actual",
    prompt:
      "Leé la fecha de nacimiento (año, mes, día) y la fecha actual (año, mes, día), seis valores en ese orden con input(). Calculá la edad en años cumplidos (si todavía no pasó el cumpleaños este año, restá 1). Imprimí la edad.",
    starterCode:
      "anio_nac = int(input())\nmes_nac = int(input())\ndia_nac = int(input())\nanio_act = int(input())\nmes_act = int(input())\ndia_act = int(input())\n# completa la logica\n",
    rewardXp: 20,
    compute: (ls) => {
      const [by, bm, bd, cy, cm, cd] = ls.map(Number);
      let age = cy - by;
      if (cm < bm || (cm === bm && cd < bd)) age -= 1;
      return String(age);
    },
    testCases: [
      { input: "2000\n5\n15\n2024\n5\n20", isHidden: false },
      { input: "2000\n5\n15\n2024\n3\n10", isHidden: true },
    ],
  },
  {
    slug: "py-1-10",
    title: "1.10 — Conversión de monedas para un viaje a Europa",
    prompt:
      "Vas a viajar a Europa y querés saber cuántos euros podés comprar. Leé el monto en pesos que tenés y la cotización del euro en pesos (con input()), y calculá cuántos euros podés comprar (monto / cotización). Imprimí el resultado con 2 decimales.",
    starterCode: "monto_pesos = float(input())\ncotizacion = float(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [monto, tasa] = ls.map(Number);
      return (monto / tasa).toFixed(2);
    },
    testCases: [
      { input: "1500\n1000", isHidden: false },
      { input: "2530\n1012", isHidden: true },
    ],
  },
  {
    slug: "py-1-11",
    title: "1.11 — Determinar si A divide a B o B a A",
    prompt:
      "Leé dos números enteros positivos A y B (con input(), en ese orden). Si son iguales, imprimí 'son iguales'. Si A es divisor de B, imprimí 'A divide a B'. Si B es divisor de A, imprimí 'B divide a A'. Si ninguno de los dos divide al otro, imprimí 'ninguno divide al otro'.",
    starterCode: "a = int(input())\nb = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      const [a, b] = ls.map(Number);
      if (a === b) return "son iguales";
      if (b % a === 0) return "A divide a B";
      if (a % b === 0) return "B divide a A";
      return "ninguno divide al otro";
    },
    testCases: [
      { input: "3\n12", isHidden: false },
      { input: "10\n3", isHidden: true },
      { input: "6\n6", isHidden: true },
    ],
  },
  {
    slug: "py-1-12",
    title: "1.12 — Composición de un número de tres cifras y múltiplo de 3",
    prompt:
      "Leé un número entero de tres cifras (con input()). Descomponelo en centena, decena y unidad, y determiná si es múltiplo de 3. Imprimí los tres dígitos y el resultado separados por espacio, por ejemplo: 3 4 5 si es multiplo de 3",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Number(ls[0]);
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;
      const mult = n % 3 === 0 ? "si es multiplo de 3" : "no es multiplo de 3";
      return `${c} ${d} ${u} ${mult}`;
    },
    testCases: [
      { input: "345", isHidden: false },
      { input: "482", isHidden: true },
    ],
  },
  {
    slug: "py-1-13",
    title: "1.13 — Cantidad de billetes de 100, 10 y 1",
    prompt:
      "Leé un monto en pesos (entero, con input()) y calculá cuántos billetes de 100, de 10 y de 1 se necesitan para pagarlo exactamente, usando la menor cantidad de billetes posible (empezando por los de mayor valor). Imprimí las tres cantidades separadas por espacio: billetes de 100, de 10 y de 1.",
    starterCode: "monto = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      let n = Number(ls[0]);
      const c100 = Math.floor(n / 100);
      n %= 100;
      const c10 = Math.floor(n / 10);
      n %= 10;
      return `${c100} ${c10} ${n}`;
    },
    testCases: [
      { input: "537", isHidden: false },
      { input: "100", isHidden: true },
    ],
  },
  {
    slug: "py-1-14",
    title: "1.14 — Compra en supermercado con descuento y tipo de entrega",
    prompt:
      "Leé el monto de una compra y un código de entrega (con input(): 1 = retiro en el local, 2 = envío a domicilio). Si retira en el local, aplicá un 10% de descuento. Si es envío a domicilio, sumá un costo fijo de envío de $500. Imprimí el total final con 2 decimales.",
    starterCode: "monto = float(input())\ntipo_entrega = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      const [monto, tipo] = ls.map(Number);
      return (tipo === 1 ? monto * 0.9 : monto + 500).toFixed(2);
    },
    testCases: [
      { input: "1000\n1", isHidden: false },
      { input: "1000\n2", isHidden: true },
    ],
  },
  {
    slug: "py-1-15",
    title: "1.15 — Altura aproximada de edificios",
    prompt:
      "Un edificio tiene una planta baja y una cantidad de pisos de igual altura. Leé (con input()) la cantidad de pisos, la altura de cada piso, y la altura de la planta baja. Calculá la altura total del edificio e imprimila con 2 decimales.",
    starterCode: "pisos = int(input())\naltura_piso = float(input())\naltura_pb = float(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [pisos, alturaPiso, pb] = ls.map(Number);
      return (pb + pisos * alturaPiso).toFixed(2);
    },
    testCases: [
      { input: "10\n3\n4", isHidden: false },
      { input: "5\n2.5\n3.5", isHidden: true },
    ],
  },
  {
    slug: "py-1-16",
    title: "1.16 — Porcentaje de egresados por carrera",
    prompt:
      "Leé la cantidad de inscriptos y la cantidad de egresados de una carrera (con input(), en ese orden). Calculá el porcentaje de egresados sobre el total de inscriptos e imprimilo con 2 decimales.",
    starterCode: "inscriptos = int(input())\negresados = int(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [insc, egr] = ls.map(Number);
      return ((egr / insc) * 100).toFixed(2);
    },
    testCases: [
      { input: "200\n50", isHidden: false },
      { input: "150\n33", isHidden: true },
    ],
  },
  {
    slug: "py-1-17",
    title: "1.17 — Producto de dos enteros usando solo suma",
    prompt:
      "Leé dos números enteros (con input()). Calculá su producto usando solamente sumas repetidas (sin usar el operador *), por ejemplo con un bucle que vaya sumando uno de los números tantas veces como indique el otro. Imprimí el resultado.",
    starterCode: "a = int(input())\nb = int(input())\n# completa la logica (sin usar *)\n",
    rewardXp: 20,
    compute: (ls) => {
      const [a, b] = ls.map(Number);
      return String(a * b);
    },
    testCases: [
      { input: "4\n5", isHidden: false },
      { input: "7\n0", isHidden: true },
    ],
  },
  {
    slug: "py-1-18",
    title: "1.18 — Cociente y resto usando solo suma y resta",
    prompt:
      "Leé un dividendo y un divisor, ambos enteros positivos (con input()). Calculá el cociente y el resto de la división usando solamente sumas y restas (sin usar los operadores // ni %), por ejemplo restando el divisor repetidamente. Imprimí el cociente y el resto separados por un espacio.",
    starterCode: "dividendo = int(input())\ndivisor = int(input())\n# completa la logica (sin usar // ni %)\n",
    rewardXp: 20,
    compute: (ls) => {
      const [a, b] = ls.map(Number);
      const q = Math.floor(a / b);
      return `${q} ${a - q * b}`;
    },
    testCases: [
      { input: "17\n5", isHidden: false },
      { input: "20\n4", isHidden: true },
    ],
  },
  {
    slug: "py-1-19",
    title: "1.19 — Valor, cuadrado y cubo de una variable V",
    prompt:
      "Leé un número entero V (con input()). Imprimí, separados por espacio, el valor de V, su cuadrado y su cubo. Por ejemplo, para V=3: 3 9 27",
    starterCode: "v = int(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const v = Number(ls[0]);
      return `${v} ${v * v} ${v * v * v}`;
    },
    testCases: [
      { input: "3", isHidden: false },
      { input: "5", isHidden: true },
    ],
  },
  {
    slug: "py-1-20",
    title: "1.20 — Tabla de V, V² y V³ con incremento repetido 10 veces",
    prompt:
      "Leé un valor inicial V y un incremento (con input()). Imprimí una tabla de 10 filas: en cada fila, el valor actual de V, su cuadrado y su cubo (separados por espacio), y después sumale el incremento a V para la fila siguiente.",
    starterCode: "v = int(input())\nincremento = int(input())\n# completa el bucle de 10 filas\n",
    rewardXp: 20,
    compute: (ls) => {
      let [v, inc] = ls.map(Number);
      const rows: string[] = [];
      for (let i = 0; i < 10; i++) {
        rows.push(`${v} ${v * v} ${v * v * v}`);
        v += inc;
      }
      return rows.join("\n");
    },
    testCases: [
      { input: "1\n1", isHidden: false },
      { input: "0\n2", isHidden: true },
    ],
  },
  {
    slug: "py-1-21",
    title: "1.21 — Repetición de n veces y suma de cuadrados",
    prompt:
      "Leé un número entero positivo N (con input()). Calculá la suma de los cuadrados de los números de 1 a N (1² + 2² + ... + N²) e imprimí el resultado.",
    starterCode: "n = int(input())\n# completa el bucle\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Number(ls[0]);
      let s = 0;
      for (let i = 1; i <= n; i++) s += i * i;
      return String(s);
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "10", isHidden: true },
    ],
  },
  {
    slug: "py-1-22",
    title: "1.22 — Determinar si un número es primo",
    prompt:
      "Leé un número entero positivo con input() y determiná si es primo (mayor que 1, sin divisores aparte de 1 y él mismo). Imprimí 'primo' o 'no primo'.",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 20,
    hint: "Un numero es primo si NINGUN numero entre 2 y la raiz cuadrada de n lo divide exactamente.",
    compute: (ls) => {
      const n = Number(ls[0]);
      if (n < 2) return "no primo";
      for (let i = 2; i * i <= n; i++) if (n % i === 0) return "no primo";
      return "primo";
    },
    testCases: [
      { input: "7", isHidden: false },
      { input: "10", isHidden: true },
      { input: "2", isHidden: true },
    ],
  },
  {
    slug: "py-1-23",
    title: "1.23 — Factura con cantidad variable de renglones",
    prompt:
      "Vas a sumar los importes de una factura con una cantidad variable de renglones. Leé primero la cantidad de renglones N (con input()), y después leé N importes, uno por uno. Calculá el total de la factura e imprimilo con 2 decimales.",
    starterCode:
      "n = int(input())\ntotal = 0.0\n# completa el bucle que lee N importes y los suma\nprint(f\"{total:.2f}\")\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Number(ls[0]);
      const precios = ls.slice(1, 1 + n).map(Number);
      return precios.reduce((a, b) => a + b, 0).toFixed(2);
    },
    testCases: [
      { input: "3\n10\n20\n5", isHidden: false },
      { input: "2\n15.5\n4.5", isHidden: true },
    ],
  },
  {
    slug: "py-1-24",
    title: "1.24 — Impuesto y cantidad de cuotas por importe",
    prompt:
      "Leé el importe de una compra (con input()). Si el importe es menor o igual a $1000, no se cobra impuesto y se paga en 1 cuota. Si es menor o igual a $5000, se cobra 5% de impuesto en 3 cuotas. Si es mayor, se cobra 10% de impuesto en 6 cuotas. Imprimí el monto del impuesto (con 2 decimales) y la cantidad de cuotas, separados por un espacio.",
    starterCode: "importe = float(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      const importe = Number(ls[0]);
      let tasa: number, cuotas: number;
      if (importe <= 1000) {
        tasa = 0;
        cuotas = 1;
      } else if (importe <= 5000) {
        tasa = 0.05;
        cuotas = 3;
      } else {
        tasa = 0.1;
        cuotas = 6;
      }
      return `${(importe * tasa).toFixed(2)} ${cuotas}`;
    },
    testCases: [
      { input: "800", isHidden: false },
      { input: "3000", isHidden: true },
      { input: "8000", isHidden: true },
    ],
  },
  {
    slug: "py-1-25",
    title: "1.25 — Primeros N números de Fibonacci",
    prompt:
      "La sucesión de Fibonacci empieza en 0, 1 y cada número siguiente es la suma de los dos anteriores. Leé un número N (con input()) e imprimí los primeros N números de Fibonacci, separados por espacio.",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      const fib = [0, 1];
      while (fib.length < n) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
      return fib.slice(0, n).join(" ");
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "8", isHidden: true },
    ],
  },
  {
    slug: "py-1-26",
    title: "1.26 — Coordenadas de una función cuadrática",
    prompt:
      "Leé los coeficientes enteros a, b y c de una función cuadrática y = ax² + bx + c, y un valor entero de x (con input(), en ese orden). Calculá el valor de y para ese x e imprimilo.",
    starterCode: "a = int(input())\nb = int(input())\nc = int(input())\nx = int(input())\n# completa el calculo\n",
    rewardXp: 10,
    compute: (ls) => {
      const [a, b, c, x] = ls.map(Number);
      return String(a * x * x + b * x + c);
    },
    testCases: [
      { input: "1\n-2\n1\n3", isHidden: false },
      { input: "2\n0\n-5\n4", isHidden: true },
    ],
  },
  {
    slug: "py-1-27",
    title: "1.27 — Varias funciones cuadráticas, con fin en 9999",
    prompt:
      "Vas a procesar varias funciones cuadráticas y = ax² + bx + c, una tras otra. Para cada una, leé a, b y c (con input(), de a uno) y calculá su discriminante. El final de los datos se marca con una fila donde a vale 9999 (en ese caso no proceses esa fila, terminá el programa). Al final, imprimí tres números separados por espacio: cuántas funciones tuvieron 2 raíces reales (discriminante > 0), cuántas tuvieron 1 raíz real (discriminante = 0), y cuántas no tuvieron raíces reales (discriminante < 0).",
    starterCode:
      "pos = 0\ncero = 0\nneg = 0\nwhile True:\n    a = float(input())\n    b = float(input())\n    c = float(input())\n    if a == 9999:\n        break\n    # completa: calcula el discriminante y actualiza los contadores\nprint(pos, cero, neg)\n",
    rewardXp: 25,
    compute: (ls) => {
      let i = 0;
      let pos = 0,
        cero = 0,
        neg = 0;
      while (true) {
        const a = Number(ls[i]);
        const b = Number(ls[i + 1]);
        const c = Number(ls[i + 2]);
        i += 3;
        if (a === 9999) break;
        const disc = b * b - 4 * a * c;
        if (disc > 0) pos++;
        else if (disc === 0) cero++;
        else neg++;
      }
      return `${pos} ${cero} ${neg}`;
    },
    testCases: [
      { input: "1\n-3\n2\n1\n2\n1\n1\n1\n1\n9999\n0\n0", isHidden: false },
      { input: "2\n8\n3\n9999\n0\n0", isHidden: true },
    ],
  },
  {
    slug: "py-1-28",
    title: "1.28 — Números de tres cifras cuya suma de cubos de dígitos es igual al número",
    prompt:
      "Un número de tres cifras es especial si es igual a la suma de los cubos de sus dígitos (por ejemplo, 153 = 1³ + 5³ + 3³). Leé un número de tres cifras (con input()) y determiná si cumple esta propiedad. Imprimí 'es armstrong' o 'no es armstrong'.",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;
      return c ** 3 + d ** 3 + u ** 3 === n ? "es armstrong" : "no es armstrong";
    },
    testCases: [
      { input: "153", isHidden: false },
      { input: "200", isHidden: true },
      { input: "370", isHidden: true },
    ],
  },
  {
    slug: "py-1-29",
    title: "1.29 — Números primos menores a n",
    prompt: "Leé un número N (con input()). Imprimí todos los números primos menores a N, separados por espacio.",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      const isPrime = (x: number) => {
        if (x < 2) return false;
        for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
        return true;
      };
      const primes: number[] = [];
      for (let i = 2; i < n; i++) if (isPrime(i)) primes.push(i);
      return primes.join(" ");
    },
    testCases: [
      { input: "10", isHidden: false },
      { input: "20", isHidden: true },
    ],
  },
  {
    slug: "py-1-30",
    title: "1.30 — Sueldo de N choferes",
    prompt:
      "Una empresa de transporte quiere saber cuánto pagó en total a sus choferes. Leé la cantidad de choferes N (con input()), y para cada uno leé las horas trabajadas y el valor por hora. Calculá el sueldo de cada chofer (horas × valor por hora) y sumalos todos. Imprimí el total pagado con 2 decimales.",
    starterCode:
      "n = int(input())\ntotal = 0.0\n# completa el bucle que lee N choferes y acumula el total\nprint(f\"{total:.2f}\")\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      let idx = 1;
      let total = 0;
      for (let i = 0; i < n; i++) {
        const horas = Number(ls[idx]);
        const valor = Number(ls[idx + 1]);
        idx += 2;
        total += horas * valor;
      }
      return total.toFixed(2);
    },
    testCases: [
      { input: "2\n8\n100\n6\n120", isHidden: false },
      { input: "1\n10\n50", isHidden: true },
    ],
  },
  {
    slug: "py-1-31",
    title: "1.31 — Peso de piezas de tela",
    prompt:
      "Una fábrica textil quiere calcular el peso total de varias piezas de tela. Leé la cantidad de piezas N (con input()), y para cada una leé su largo en metros y el peso por metro. Calculá el peso de cada pieza (largo × peso por metro) y sumalos todos. Imprimí el peso total con 2 decimales.",
    starterCode:
      "n = int(input())\ntotal = 0.0\n# completa el bucle que lee N piezas y acumula el total\nprint(f\"{total:.2f}\")\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      let idx = 1;
      let total = 0;
      for (let i = 0; i < n; i++) {
        const largo = Number(ls[idx]);
        const pesoM = Number(ls[idx + 1]);
        idx += 2;
        total += largo * pesoM;
      }
      return total.toFixed(2);
    },
    testCases: [
      { input: "2\n10\n0.5\n20\n0.3", isHidden: false },
      { input: "1\n15\n1", isHidden: true },
    ],
  },
  {
    slug: "py-1-32",
    title: "1.32 — Fecha del domingo de Pascua",
    prompt:
      "El domingo de Pascua de un año se calcula con el algoritmo de Gauss. Leé el año con input() y, usando división entera (//) y módulo (%), calculá:\na = año % 19\nb = año // 100\nc = año % 100\nd = b // 4\ne = b % 4\nf = (b + 8) // 25\ng = (b - f + 1) // 3\nh = (19*a + b - d - g + 15) % 30\ni = c // 4\nk = c % 4\nl = (32 + 2*e + 2*i - h - k) % 7\nm = (a + 11*h + 22*l) // 451\nmes = (h + l - 7*m + 114) // 31\ndia = (h + l - 7*m + 114) % 31 + 1\nImprimí el día y el mes separados por un espacio.",
    starterCode:
      "anio = int(input())\n# completa el calculo del algoritmo de Gauss (a, b, c, d, e, f, g, h, i, k, l, m, dia, mes)\n",
    rewardXp: 25,
    hint: "Segui la formula paso a paso, variable por variable, en el mismo orden en que aparece en la consigna.",
    compute: (ls) => {
      const year = Number(ls[0]);
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const mes = Math.floor((h + l - 7 * m + 114) / 31);
      const dia = ((h + l - 7 * m + 114) % 31) + 1;
      return `${dia} ${mes}`;
    },
    testCases: [
      { input: "2024", isHidden: false },
      { input: "2025", isHidden: true },
    ],
  },
  {
    slug: "py-1-33",
    title: "1.33 — Sucesión de pares en forma de triángulo ascendente",
    prompt:
      "Leé un número N (con input()). Imprimí un triángulo de N filas: en la fila i, los primeros i números pares (2, 4, 6, ...) separados por espacio. Por ejemplo, para N=3:\n2\n2 4\n2 4 6",
    starterCode: "n = int(input())\n# completa el bucle\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      const rows: string[] = [];
      for (let i = 1; i <= n; i++) {
        const row: number[] = [];
        for (let j = 1; j <= i; j++) row.push(2 * j);
        rows.push(row.join(" "));
      }
      return rows.join("\n");
    },
    testCases: [
      { input: "3", isHidden: false },
      { input: "4", isHidden: true },
    ],
  },
  {
    slug: "py-1-34",
    title: "1.34 — Sucesión de pares en forma de triángulo descendente",
    prompt:
      "Leé un número N (con input()). Imprimí un triángulo de N filas, esta vez decreciente: la primera fila tiene N números pares, y cada fila siguiente tiene uno menos, hasta llegar a 1. Por ejemplo, para N=3:\n2 4 6\n2 4\n2",
    starterCode: "n = int(input())\n# completa el bucle\n",
    rewardXp: 20,
    compute: (ls) => {
      const n = Number(ls[0]);
      const rows: string[] = [];
      for (let i = 1; i <= n; i++) {
        const count = n - i + 1;
        const row: number[] = [];
        for (let j = 1; j <= count; j++) row.push(2 * j);
        rows.push(row.join(" "));
      }
      return rows.join("\n");
    },
    testCases: [
      { input: "3", isHidden: false },
      { input: "4", isHidden: true },
    ],
  },
  {
    slug: "py-1-35",
    title: "1.35 — Cantidad de billetes de 500 a 1",
    prompt:
      "Leé un monto en pesos (entero, con input()). Calculá cuántos billetes de 500, 100, 50, 20, 10, 5, 2 y 1 se necesitan para pagarlo exactamente, usando la menor cantidad posible de billetes (de mayor a menor denominación). Imprimí las ocho cantidades separadas por espacio, en ese orden.",
    starterCode: "monto = int(input())\n# completa la logica\n",
    rewardXp: 20,
    compute: (ls) => {
      const denoms = [500, 100, 50, 20, 10, 5, 2, 1];
      let n = Number(ls[0]);
      const counts: number[] = [];
      for (const d of denoms) {
        counts.push(Math.floor(n / d));
        n %= d;
      }
      return counts.join(" ");
    },
    testCases: [
      { input: "777", isHidden: false },
      { input: "38", isHidden: true },
    ],
  },
  {
    slug: "py-1-36",
    title: "1.36 — Determinar si un número es múltiplo de 3 según la suma de sus dígitos",
    prompt:
      "Un número es múltiplo de 3 si la suma de sus dígitos también es múltiplo de 3. Leé un número entero (con input()), calculá la suma de sus dígitos, y determiná si el número original es múltiplo de 3. Imprimí 'es multiplo de 3' o 'no es multiplo de 3'.",
    starterCode: "n = int(input())\n# completa la logica\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Math.abs(Number(ls[0]));
      const s = String(n)
        .split("")
        .reduce((acc, ch) => acc + Number(ch), 0);
      return s % 3 === 0 ? "es multiplo de 3" : "no es multiplo de 3";
    },
    testCases: [
      { input: "123", isHidden: false },
      { input: "124", isHidden: true },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Unidad 3: Subacciones (1.2.1 a 1.2.11)
// ─────────────────────────────────────────────────────────────────────────
const subacciones: SeedExercise[] = [
  {
    slug: "py-1-2-1",
    title: "1.2.1 — Cuadrado de un número",
    prompt:
      "Escribí una función cuadrado(n) que reciba un número y devuelva su cuadrado. Después, en el programa principal, leé un número con input(), llamá a la función, e imprimí el resultado.",
    starterCode: "def cuadrado(n):\n    # completa la funcion\n    pass\n\nn = int(input())\nprint(cuadrado(n))\n",
    rewardXp: 10,
    compute: (ls) => {
      const n = Number(ls[0]);
      return String(n * n);
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "-3", isHidden: true },
      { input: "12", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-2",
    title: "1.2.2 — Suma de los dígitos de un número natural",
    prompt:
      "Escribí una función suma_digitos(n) que reciba un número natural y devuelva la suma de sus dígitos. En el programa principal, leé un número con input(), llamá a la función e imprimí el resultado.",
    starterCode:
      "def suma_digitos(n):\n    # completa la funcion\n    pass\n\nn = int(input())\nprint(suma_digitos(n))\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Number(ls[0]);
      return String(
        String(n)
          .split("")
          .reduce((a, c) => a + Number(c), 0),
      );
    },
    testCases: [
      { input: "123", isHidden: false },
      { input: "9999", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-3",
    title: "1.2.3 — Mínimo de 3 números, repetido las veces que se quiera",
    prompt:
      "Escribí una función minimo(a, b, c) que devuelva el menor de tres números. En el programa principal, leé primero cuántas veces se va a repetir el proceso (N), y después, para cada repetición, leé tres números, llamá a la función e imprimí el mínimo (uno por línea).",
    starterCode:
      "def minimo(a, b, c):\n    # completa la funcion\n    pass\n\nn = int(input())\nfor _ in range(n):\n    a = int(input())\n    b = int(input())\n    c = int(input())\n    print(minimo(a, b, c))\n",
    rewardXp: 15,
    compute: (ls) => {
      const n = Number(ls[0]);
      let idx = 1;
      const mins: number[] = [];
      for (let r = 0; r < n; r++) {
        const a = Number(ls[idx]);
        const b = Number(ls[idx + 1]);
        const c = Number(ls[idx + 2]);
        idx += 3;
        mins.push(Math.min(a, b, c));
      }
      return mins.join("\n");
    },
    testCases: [
      { input: "2\n5\n1\n3\n10\n10\n2", isHidden: false },
      { input: "1\n7\n8\n9", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-4",
    title: "1.2.4 — Clave de un valor, aplicada a varios valores",
    prompt:
      "Escribí una función clave(x) que, si x es negativo, devuelva -1; si es positivo o cero, devuelva la suma de sus dígitos módulo 7. En el programa principal, leé cuántos valores vas a procesar (N) y después los N valores; para cada uno, imprimí el resultado de clave(x) (uno por línea).",
    starterCode:
      "def clave(x):\n    # completa la funcion\n    pass\n\nn = int(input())\nfor _ in range(n):\n    x = int(input())\n    print(clave(x))\n",
    rewardXp: 20,
    compute: (ls) => {
      const clave = (x: number) => {
        if (x < 0) return -1;
        const s = String(x)
          .split("")
          .reduce((a, c) => a + Number(c), 0);
        return s % 7;
      };
      const n = Number(ls[0]);
      const vals = ls.slice(1, 1 + n).map(Number);
      return vals.map(clave).join("\n");
    },
    testCases: [
      { input: "3\n-5\n23\n10", isHidden: false },
      { input: "2\n100\n-1", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-5",
    title: "1.2.5 — Verificar si un carácter es un dígito",
    prompt:
      "Escribí una función es_digito(c) que reciba un carácter (un string de longitud 1) y devuelva True si es un dígito ('0' a '9'), o False en caso contrario. En el programa principal, leé un carácter con input() e imprimí el resultado de llamar a la función.",
    starterCode: "def es_digito(c):\n    # completa la funcion\n    pass\n\nc = input()\nprint(es_digito(c))\n",
    rewardXp: 10,
    compute: (ls) => {
      const ch = ls[0];
      return ch.length === 1 && ch >= "0" && ch <= "9" ? "True" : "False";
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "a", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-6",
    title: "1.2.6 — Descuento según unidades y precio de un producto",
    prompt:
      "Escribí una función descuento(unidades, precio) que calcule el descuento en pesos de una compra: 4% si se compran más de 6 unidades, 10% si se compran más de 12, o 0% si no. El descuento se calcula sobre el total (unidades × precio). En el programa principal, leé las unidades y el precio (con input()), llamá a la función e imprimí el descuento con 2 decimales.",
    starterCode:
      "def descuento(unidades, precio):\n    # completa la funcion\n    pass\n\nunidades = int(input())\nprecio = float(input())\nprint(f\"{descuento(unidades, precio):.2f}\")\n",
    rewardXp: 15,
    compute: (ls) => {
      const [unidades, precio] = ls.map(Number);
      let tasa = 0;
      if (unidades > 12) tasa = 0.1;
      else if (unidades > 6) tasa = 0.04;
      return (unidades * precio * tasa).toFixed(2);
    },
    testCases: [
      { input: "10\n100", isHidden: false },
      { input: "15\n50", isHidden: true },
      { input: "3\n20", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-7",
    title: "1.2.7 — Repetir la verificación de dígito como procedimiento",
    prompt:
      "Repetí el ejercicio de verificar si un carácter es un dígito, pero esta vez como un procedimiento: en vez de devolver el resultado con return, la función mostrar_es_digito(c) debe imprimirlo directamente con print(). En el programa principal, leé el carácter y llamá al procedimiento (sin volver a imprimir en el programa principal).",
    starterCode:
      "def mostrar_es_digito(c):\n    # completa el procedimiento (usa print, no return)\n    pass\n\nc = input()\nmostrar_es_digito(c)\n",
    rewardXp: 10,
    compute: (ls) => {
      const ch = ls[0];
      return ch.length === 1 && ch >= "0" && ch <= "9" ? "True" : "False";
    },
    testCases: [
      { input: "7", isHidden: false },
      { input: "x", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-8",
    title: "1.2.8 — Intercambiar los valores de dos variables",
    prompt:
      "En Python, una función no puede modificar directamente las variables del programa principal, pero puede devolver los valores ya intercambiados. Escribí una función intercambiar(a, b) que devuelva una tupla (b, a) (los valores cambiados de orden). En el programa principal, leé dos números, llamá a la función, y usá el resultado para imprimir los valores ya intercambiados, separados por un espacio.",
    starterCode:
      "def intercambiar(a, b):\n    # completa la funcion (devuelve una tupla)\n    pass\n\na = int(input())\nb = int(input())\nnuevo_a, nuevo_b = intercambiar(a, b)\nprint(nuevo_a, nuevo_b)\n",
    rewardXp: 15,
    compute: (ls) => {
      const [a, b] = ls.map(Number);
      return `${b} ${a}`;
    },
    testCases: [
      { input: "3\n7", isHidden: false },
      { input: "-1\n5", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-9",
    title: "1.2.9 — Mostrar los dígitos 0, 1 y 9 en tamaño grande",
    prompt:
      "Escribí tres procedimientos: mostrar_0(), mostrar_1() y mostrar_9(), que impriman (con print, una fila por línea) el dígito correspondiente dibujado en grande con asteriscos, usando esta grilla de 5 filas por 3 columnas:\n\nDígito 0:\n***\n* *\n* *\n* *\n***\n\nDígito 1:\n  *\n  *\n  *\n  *\n  *\n\nDígito 9:\n***\n* *\n***\n  *\n***\n\nEn el programa principal, leé un dígito como texto (con input()) y llamá al procedimiento que corresponda. Si no es '0', '1' o '9', imprimí 'no disponible'.",
    starterCode:
      "def mostrar_0():\n    # completa: imprime el 0 en grande (5 lineas)\n    pass\n\ndef mostrar_1():\n    # completa: imprime el 1 en grande (5 lineas)\n    pass\n\ndef mostrar_9():\n    # completa: imprime el 9 en grande (5 lineas)\n    pass\n\nd = input()\nif d == '0':\n    mostrar_0()\nelif d == '1':\n    mostrar_1()\nelif d == '9':\n    mostrar_9()\nelse:\n    print('no disponible')\n",
    rewardXp: 20,
    compute: (ls) => {
      const art: Record<string, string[]> = {
        "0": ["***", "* *", "* *", "* *", "***"],
        "1": ["  *", "  *", "  *", "  *", "  *"],
        "9": ["***", "* *", "***", "  *", "***"],
      };
      const d = ls[0];
      return art[d] ? art[d].join("\n") : "no disponible";
    },
    testCases: [
      { input: "0", isHidden: false },
      { input: "1", isHidden: true },
      { input: "9", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-10",
    title: "1.2.10 — Un único procedimiento que muestra cualquier dígito en grande",
    prompt:
      "Escribí un único procedimiento mostrar_nro(d) que reciba un dígito (como texto, '0' a '9') y lo imprima dibujado en grande con asteriscos, usando la misma idea del ejercicio anterior pero generalizada a cualquier dígito. Te dejamos la grilla completa de los 10 dígitos en el código inicial (no la modifiques): usala para imprimir las 5 filas correspondientes. En el programa principal, leé un dígito con input() y llamá al procedimiento.",
    starterCode:
      "# Grilla de cada digito (5 filas x 3 columnas). No la modifiques.\nGRILLA = {\n    '0': ['***', '* *', '* *', '* *', '***'],\n    '1': ['  *', '  *', '  *', '  *', '  *'],\n    '2': ['***', '  *', '***', '*  ', '***'],\n    '3': ['***', '  *', '***', '  *', '***'],\n    '4': ['* *', '* *', '***', '  *', '  *'],\n    '5': ['***', '*  ', '***', '  *', '***'],\n    '6': ['***', '*  ', '***', '* *', '***'],\n    '7': ['***', '  *', '  *', '  *', '  *'],\n    '8': ['***', '* *', '***', '* *', '***'],\n    '9': ['***', '* *', '***', '  *', '***'],\n}\n\ndef mostrar_nro(d):\n    # completa: imprime las 5 filas de GRILLA[d]\n    pass\n\nd = input()\nmostrar_nro(d)\n",
    rewardXp: 15,
    compute: (ls) => {
      const art: Record<string, string[]> = {
        "0": ["***", "* *", "* *", "* *", "***"],
        "1": ["  *", "  *", "  *", "  *", "  *"],
        "2": ["***", "  *", "***", "*  ", "***"],
        "3": ["***", "  *", "***", "  *", "***"],
        "4": ["* *", "* *", "***", "  *", "  *"],
        "5": ["***", "*  ", "***", "  *", "***"],
        "6": ["***", "*  ", "***", "* *", "***"],
        "7": ["***", "  *", "  *", "  *", "  *"],
        "8": ["***", "* *", "***", "* *", "***"],
        "9": ["***", "* *", "***", "  *", "***"],
      };
      return art[ls[0]].join("\n");
    },
    testCases: [
      { input: "5", isHidden: false },
      { input: "8", isHidden: true },
      { input: "7", isHidden: true },
    ],
  },
  {
    slug: "py-1-2-11",
    title: "1.2.11 — Menú de operaciones (sumar, restar, multiplicar, dividir)",
    prompt:
      "Escribí cuatro funciones: sumar(a, b), restar(a, b), multiplicar(a, b) y dividir(a, b), cada una con la operación correspondiente. En el programa principal, leé una opción (1 = sumar, 2 = restar, 3 = multiplicar, 4 = dividir) y los dos números (con input()). Llamá a la función que corresponda según la opción e imprimí el resultado (si es división, con 2 decimales; si no, como número entero).",
    starterCode:
      "def sumar(a, b):\n    # completa la funcion\n    pass\n\ndef restar(a, b):\n    # completa la funcion\n    pass\n\ndef multiplicar(a, b):\n    # completa la funcion\n    pass\n\ndef dividir(a, b):\n    # completa la funcion\n    pass\n\nopcion = int(input())\na = int(input())\nb = int(input())\nif opcion == 1:\n    print(sumar(a, b))\nelif opcion == 2:\n    print(restar(a, b))\nelif opcion == 3:\n    print(multiplicar(a, b))\nelif opcion == 4:\n    print(f\"{dividir(a, b):.2f}\")\n",
    rewardXp: 20,
    compute: (ls) => {
      const [op, a, b] = ls.map(Number);
      if (op === 1) return String(a + b);
      if (op === 2) return String(a - b);
      if (op === 3) return String(a * b);
      if (op === 4) return (a / b).toFixed(2);
      return "opcion invalida";
    },
    testCases: [
      { input: "1\n5\n3", isHidden: false },
      { input: "4\n10\n4", isHidden: true },
      { input: "3\n6\n7", isHidden: true },
    ],
  },
];

const units: SeedUnit[] = [
  { slug: "python-fundamentos-u1-secuenciales", title: "Estructuras Secuenciales", exercises: secuenciales },
  { slug: "python-fundamentos-u2-condicionales", title: "Condicionales y Repetitivas", exercises: condicionales },
  { slug: "python-fundamentos-u3-subacciones", title: "Subacciones", exercises: subacciones },
];

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: COURSE.slug },
    update: { title: COURSE.title, description: COURSE.description },
    create: COURSE,
  });

  for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
    const unitSpec = units[unitIndex];
    const unit = await prisma.unit.upsert({
      where: { slug: unitSpec.slug },
      update: { title: unitSpec.title, order: unitIndex, courseId: course.id },
      create: { slug: unitSpec.slug, title: unitSpec.title, order: unitIndex, courseId: course.id },
    });

    for (let exIndex = 0; exIndex < unitSpec.exercises.length; exIndex++) {
      const exSpec = unitSpec.exercises[exIndex];
      const existing = await prisma.exercise.findFirst({ where: { slug: exSpec.slug } });
      const data = {
        title: exSpec.title,
        type: "code_runner" as const,
        order: exIndex,
        prompt: exSpec.prompt,
        starterCode: exSpec.starterCode,
        language: "python",
        rewardXp: exSpec.rewardXp,
        hint: exSpec.hint ?? null,
        unitId: unit.id,
      };
      const exercise = existing
        ? await prisma.exercise.update({ where: { id: existing.id }, data })
        : await prisma.exercise.create({ data: { ...data, slug: exSpec.slug } });

      await prisma.testCase.deleteMany({ where: { exerciseId: exercise.id } });
      await prisma.testCase.createMany({
        data: exSpec.testCases.map((tc, tcIndex) => ({
          exerciseId: exercise.id,
          order: tcIndex,
          input: tc.input,
          expectedOutput: exSpec.compute(lines(tc.input)),
          isHidden: tc.isHidden,
        })),
      });
    }
    console.log(`Unidad "${unitSpec.title}": ${unitSpec.exercises.length} ejercicios.`);
  }

  console.log("Seed del curso de Python completado.");
}

export { units, COURSE };

if (require.main === module) {
  main().finally(() => prisma.$disconnect());
}

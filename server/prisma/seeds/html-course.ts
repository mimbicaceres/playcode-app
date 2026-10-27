import { DomQuery } from "../../../src/lib/htmlExec";
import { SeedCourseSpec, SeedExerciseSpec, upsertCourse } from "./shared";

// Curso "HTML y CSS: Fundamentos": 18 ejercicios que se validan en el navegador
// sobre el DOM RESULTANTE (elementos, texto, atributos, estilos calculados y
// posiciones), nunca con regex sobre el texto que escribio el alumno. Ver
// src/lib/htmlExec.ts.
//
// Cada ejercicio declara sus chequeos UNA vez: `check(selector, esperado)`. De
// ahi salen tanto las mediciones que se piden al navegador (el `spec` del caso)
// como el resultado esperado (`expectedOutput`). El caso visible mide lo que
// pide la consigna; el oculto mide otras propiedades de la misma pagina (la
// estructura, que no se haya tocado lo que no correspondia, etc.).
//
// Los valores esperados estan en el formato que devuelve el navegador (colores
// como rgb(...), medidas en px). No los calcula el servidor: los confirma
// `npm run verify:html-course`, que renderiza las soluciones de referencia en un
// Chromium real con la misma funcion que usa la app.
//
// Idempotente: correrlo de nuevo actualiza el contenido por slug.

type Expected = Record<string, unknown>;
interface Check {
  query: DomQuery;
  expected: Expected;
}

// Las claves de `expected` son exactamente las mediciones que se piden.
function check(selector: string, expected: Expected): Check {
  const query: DomQuery = { selector };
  for (const [key, value] of Object.entries(expected)) {
    if (key === "count" || key === "text" || key === "texts" || key === "hasText" || key === "rects") {
      (query as unknown as Record<string, unknown>)[key] = true;
    } else {
      (query as unknown as Record<string, unknown>)[key] = Object.keys(value as object);
    }
  }
  return { query, expected };
}

export const expectedOutputOf = (checks: Check[]) =>
  JSON.stringify(checks.map((c) => ({ selector: c.query.selector, ...c.expected })));

export interface HtmlExercise {
  slug: string;
  title: string;
  prompt: string;
  starterCode: string;
  rewardXp: number;
  hint: string;
  // Solo para verificacion (no se guardan): la solucion de referencia, variantes
  // correctas que DEBEN pasar y errores tipicos que DEBEN fallar.
  solution: string;
  alternatives?: string[];
  wrong?: string[];
  visible: Check[];
  hidden: Check[];
}

interface HtmlUnit {
  slug: string;
  title: string;
  exercises: HtmlExercise[];
}

export const COURSE = {
  slug: "html-css-fundamentos",
  title: "HTML y CSS: Fundamentos",
  description:
    "Aprendé a construir páginas web escribiendo HTML y CSS: tu código se dibuja en el navegador y se revisa sobre la página real, no sobre el texto.",
};

const RED = "rgb(255, 0, 0)";

// ─── Unidad 1: Estructura (10 XP) ───────────────────────────────────────────
const estructura: HtmlExercise[] = [
  {
    slug: "html-1-1",
    title: "Título y párrafo",
    prompt:
      "Escribí un título principal (h1) con el texto Mi primera página y, justo debajo, un párrafo (p) con la descripción que quieras.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Las etiquetas se abren y se cierran: <h1>Mi primera página</h1>. Después, en otra línea, un <p>…</p>.",
    solution: "<h1>Mi primera página</h1>\n<p>Hola, bienvenidos a mi sitio.</p>",
    wrong: ["<h2>Mi primera página</h2>\n<p>Hola</p>", "<p>Hola</p>\n<h1>Mi primera página</h1>"],
    visible: [check("h1", { count: 1, text: "Mi primera página" }), check("p", { count: 1, hasText: true })],
    hidden: [check("body > h1", { count: 1 }), check("h1 + p", { count: 1 })],
  },
  {
    slug: "html-1-2",
    title: "Tarjeta de perfil",
    prompt:
      "Armá una tarjeta de perfil: una sección (section) que contenga un subtítulo (h2) con tu nombre y un párrafo (p) con una breve descripción. La sección tiene que tener solo esos dos elementos adentro.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Los elementos van anidados: el h2 y el p se escriben ENTRE <section> y </section>.",
    solution: "<section>\n  <h2>Ana López</h2>\n  <p>Estudio cuarto año y me gusta programar.</p>\n</section>",
    wrong: ["<section></section>\n<h2>Ana</h2>\n<p>Hola</p>"],
    visible: [
      check("section", { count: 1 }),
      check("section > h2", { count: 1, hasText: true }),
      check("section > p", { count: 1, hasText: true }),
    ],
    hidden: [check("section > *", { count: 2 }), check("h2 + p", { count: 1 })],
  },
  {
    slug: "html-1-3",
    title: "Encabezado, contenido y pie",
    prompt:
      "Armá la estructura básica de una página: un header con un título h1 adentro, un main con un párrafo adentro y un footer con algún texto. Los tres van directamente dentro de la página, en ese orden.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Son tres bloques hermanos, uno debajo del otro: <header>…</header>, <main>…</main> y <footer>…</footer>.",
    solution: "<header><h1>Mi sitio</h1></header>\n<main><p>Contenido principal.</p></main>\n<footer>Hecho en clase</footer>",
    wrong: ["<main><p>Contenido</p></main>\n<header><h1>Sitio</h1></header>\n<footer>Pie</footer>"],
    visible: [
      check("body > header > h1", { count: 1, hasText: true }),
      check("body > main > p", { count: 1, hasText: true }),
      check("body > footer", { count: 1, hasText: true }),
    ],
    hidden: [check("header + main + footer", { count: 1 })],
  },
];

// ─── Unidad 2: Texto y listas (10 XP) ───────────────────────────────────────
const listas: HtmlExercise[] = [
  {
    slug: "html-2-1",
    title: "Lista de compras",
    prompt:
      "Escribí una lista sin orden (ul) con tres elementos (li), en este orden: Pan, Leche y Huevos.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Una lista sin orden es <ul>, y cada ítem va en su propio <li>…</li> adentro de ella.",
    solution: "<ul>\n  <li>Pan</li>\n  <li>Leche</li>\n  <li>Huevos</li>\n</ul>",
    wrong: ["<ol><li>Pan</li><li>Leche</li><li>Huevos</li></ol>"],
    visible: [check("ul", { count: 1 }), check("ul > li", { count: 3, texts: ["Pan", "Leche", "Huevos"] })],
    hidden: [check("ol", { count: 0 }), check("li", { count: 3 })],
  },
  {
    slug: "html-2-2",
    title: "Pasos de una receta",
    prompt:
      "Escribí una lista ordenada (ol) con los cuatro pasos de una receta: Batir los huevos, Agregar la leche, Mezclar con la harina y Cocinar en el horno.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Cuando el orden importa se usa <ol> (ordered list) en lugar de <ul>; los pasos siguen siendo <li>.",
    solution:
      "<ol>\n  <li>Batir los huevos</li>\n  <li>Agregar la leche</li>\n  <li>Mezclar con la harina</li>\n  <li>Cocinar en el horno</li>\n</ol>",
    wrong: ["<ul><li>Batir los huevos</li><li>Agregar la leche</li><li>Mezclar con la harina</li><li>Cocinar en el horno</li></ul>"],
    visible: [
      check("ol > li", {
        count: 4,
        texts: ["Batir los huevos", "Agregar la leche", "Mezclar con la harina", "Cocinar en el horno"],
      }),
    ],
    hidden: [check("ol", { count: 1 }), check("ul", { count: 0 })],
  },
  {
    slug: "html-2-3",
    title: "Texto con énfasis",
    prompt:
      "Escribí un párrafo que diga exactamente: Hoy hay prueba de matemática. La palabra prueba tiene que estar en negrita (con la etiqueta strong) y la palabra matemática en cursiva (con la etiqueta em).",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Envolvé solo esas palabras: Hoy hay <strong>prueba</strong> de <em>matemática</em>, todo dentro de un <p>.",
    solution: "<p>Hoy hay <strong>prueba</strong> de <em>matemática</em></p>",
    alternatives: ["<p>\n  Hoy hay <strong>prueba</strong>\n  de <em>matemática</em>\n</p>"],
    wrong: ["<p>Hoy hay prueba de matemática</p>", "<p><strong>Hoy hay prueba de matemática</strong></p>"],
    visible: [
      check("p", { count: 1, text: "Hoy hay prueba de matemática" }),
      check("p > strong", { count: 1, text: "prueba" }),
      check("p > em", { count: 1, text: "matemática" }),
    ],
    hidden: [check("p > strong", { styles: { fontWeight: "700" } }), check("p > em", { styles: { fontStyle: "italic" } })],
  },
];

// ─── Unidad 3: Enlaces e imágenes (10 XP) ───────────────────────────────────
const enlaces: HtmlExercise[] = [
  {
    slug: "html-3-1",
    title: "Enlace a otra página",
    prompt: "Creá un enlace con el texto Wikipedia que lleve a la dirección https://es.wikipedia.org.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Un enlace es <a href=\"dirección\">texto</a>: la dirección va en el atributo href y el texto que se ve va entre las etiquetas.",
    solution: '<a href="https://es.wikipedia.org">Wikipedia</a>',
    wrong: ['<a>https://es.wikipedia.org</a>', '<a href="wikipedia.org">Wikipedia</a>'],
    visible: [check("a", { count: 1, text: "Wikipedia", attrs: { href: "https://es.wikipedia.org" } })],
    hidden: [check('a[href="https://es.wikipedia.org"]', { count: 1 }), check("a", { styles: { textDecorationLine: "underline" } })],
  },
  {
    slug: "html-3-2",
    title: "Imagen con texto alternativo",
    prompt:
      "Insertá la imagen logo.png y agregale el texto alternativo Logo de la escuela, que es lo que leen los lectores de pantalla cuando no se puede ver la imagen.",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Las imágenes usan la etiqueta <img> (no lleva cierre) con dos atributos: src para el archivo y alt para el texto alternativo.",
    solution: '<img src="logo.png" alt="Logo de la escuela">',
    wrong: ['<img src="logo.png">', '<img alt="Logo de la escuela">'],
    visible: [check("img", { count: 1, attrs: { src: "logo.png", alt: "Logo de la escuela" } })],
    hidden: [check("img[alt]", { count: 1 }), check('img[src="logo.png"]', { count: 1 })],
  },
  {
    slug: "html-3-3",
    title: "Menú de navegación",
    prompt:
      "Armá un menú de navegación: un nav que contenga una lista sin orden (ul) con tres ítems (li), cada uno con un enlace. Los textos y direcciones son: Inicio (#inicio), Cursos (#cursos) y Contacto (#contacto).",
    starterCode: "<!-- Escribí tu HTML acá -->\n",
    rewardXp: 10,
    hint: "Anidá así: <nav><ul><li><a href=\"#inicio\">Inicio</a></li> … </ul></nav>. Cada <li> lleva su propio <a>.",
    solution:
      '<nav>\n  <ul>\n    <li><a href="#inicio">Inicio</a></li>\n    <li><a href="#cursos">Cursos</a></li>\n    <li><a href="#contacto">Contacto</a></li>\n  </ul>\n</nav>',
    wrong: ['<ul><li><a href="#inicio">Inicio</a></li><li><a href="#cursos">Cursos</a></li><li><a href="#contacto">Contacto</a></li></ul>'],
    visible: [
      check("nav > ul > li > a", {
        count: 3,
        texts: ["Inicio", "Cursos", "Contacto"],
        attrsAll: { href: ["#inicio", "#cursos", "#contacto"] },
      }),
    ],
    hidden: [check("nav", { count: 1 }), check("nav a", { count: 3 })],
  },
];

// ─── Unidad 4: Selectores y colores (20 XP) ─────────────────────────────────
const selectores: HtmlExercise[] = [
  {
    slug: "html-4-1",
    title: "Cambiar el color de los títulos",
    prompt:
      "La página tiene dos títulos h2 y un párrafo. Escribí una regla de CSS para que todos los h2 se vean de color rojo (red). El párrafo no tiene que cambiar.",
    starterCode:
      "<style>\n  /* escribí tus reglas acá */\n</style>\n\n<h2>Unidad 1</h2>\n<p>Texto de ejemplo.</p>\n<h2>Unidad 2</h2>\n",
    rewardXp: 20,
    hint: "Una regla CSS tiene selector y declaraciones: h2 { color: red; }. Si usás * o body, el párrafo también cambia.",
    solution: "<style>\n  h2 { color: red; }\n</style>\n\n<h2>Unidad 1</h2>\n<p>Texto de ejemplo.</p>\n<h2>Unidad 2</h2>",
    alternatives: ["<style>h2 { color: #f00; }</style><h2>Unidad 1</h2><p>Texto de ejemplo.</p><h2>Unidad 2</h2>"],
    wrong: ["<style>* { color: red; }</style><h2>Unidad 1</h2><p>Texto de ejemplo.</p><h2>Unidad 2</h2>"],
    visible: [
      check("h2", { count: 2, stylesAll: { color: [RED, RED] } }),
      check("p", { styles: { color: "rgb(0, 0, 0)" } }),
    ],
    hidden: [check("h2:last-of-type", { styles: { color: RED } })],
  },
  {
    slug: "html-4-2",
    title: "Estilo por clase",
    prompt:
      "Dos de los tres párrafos tienen la clase destacado. Definí en CSS la clase .destacado con fondo amarillo (yellow) y letra en negrita (bold). El párrafo que no tiene la clase no tiene que cambiar.",
    starterCode:
      '<style>\n  /* escribí tus reglas acá */\n</style>\n\n<p class="destacado">Primero</p>\n<p>Segundo</p>\n<p class="destacado">Tercero</p>\n',
    rewardXp: 20,
    hint: "Las clases se seleccionan con un punto: .destacado { background-color: yellow; font-weight: bold; }",
    solution:
      '<style>\n  .destacado { background-color: yellow; font-weight: bold; }\n</style>\n\n<p class="destacado">Primero</p>\n<p>Segundo</p>\n<p class="destacado">Tercero</p>',
    wrong: ['<style>p { background-color: yellow; font-weight: bold; }</style><p class="destacado">Primero</p><p>Segundo</p><p class="destacado">Tercero</p>'],
    visible: [
      check("p.destacado", {
        count: 2,
        stylesAll: { backgroundColor: ["rgb(255, 255, 0)", "rgb(255, 255, 0)"], fontWeight: ["700", "700"] },
      }),
      check("p:not(.destacado)", { count: 1, stylesAll: { backgroundColor: ["rgba(0, 0, 0, 0)"], fontWeight: ["400"] } }),
    ],
    hidden: [check("p", { count: 3 })],
  },
  {
    slug: "html-4-3",
    title: "Botón azul con texto blanco",
    prompt:
      "Dale al botón de clase .boton un fondo azul (blue) y el texto en color blanco (white). No cambies el texto del botón.",
    starterCode: '<style>\n  /* escribí tus reglas acá */\n</style>\n\n<button class="boton">Enviar</button>\n',
    rewardXp: 20,
    hint: "El fondo se cambia con background-color y el color de la letra con color: .boton { background-color: blue; color: white; }",
    solution: '<style>\n  .boton { background-color: blue; color: white; }\n</style>\n\n<button class="boton">Enviar</button>',
    alternatives: ['<style>.boton { background: #0000ff; color: #fff; }</style><button class="boton">Enviar</button>'],
    wrong: ['<style>.boton { color: blue; background-color: white; }</style><button class="boton">Enviar</button>'],
    visible: [
      check("button.boton", {
        count: 1,
        text: "Enviar",
        styles: { backgroundColor: "rgb(0, 0, 255)", color: "rgb(255, 255, 255)" },
      }),
    ],
    hidden: [check("button", { count: 1, text: "Enviar" })],
  },
];

// ─── Unidad 5: Modelo de caja (20 XP) ───────────────────────────────────────
const caja: HtmlExercise[] = [
  {
    slug: "html-5-1",
    title: "Margen y relleno de una tarjeta",
    prompt:
      "A la clase .tarjeta dale un relleno interno (padding) de 16px y un margen externo (margin) de 24px, en los cuatro lados.",
    starterCode:
      '<style>\n  .tarjeta {\n    background: #eef;\n    /* agregá el padding y el margin */\n  }\n</style>\n\n<div class="tarjeta">Contenido de la tarjeta</div>\n',
    rewardXp: 20,
    hint: "padding es el espacio de adentro (entre el contenido y el borde) y margin el de afuera. Con una sola medida se aplica a los cuatro lados: padding: 16px; margin: 24px;",
    solution:
      '<style>\n  .tarjeta { background: #eef; padding: 16px; margin: 24px; }\n</style>\n\n<div class="tarjeta">Contenido de la tarjeta</div>',
    wrong: ['<style>.tarjeta { background: #eef; padding: 24px; margin: 16px; }</style><div class="tarjeta">Contenido de la tarjeta</div>'],
    visible: [
      check(".tarjeta", {
        count: 1,
        styles: {
          paddingTop: "16px",
          paddingRight: "16px",
          paddingBottom: "16px",
          paddingLeft: "16px",
          marginTop: "24px",
          marginRight: "24px",
          marginBottom: "24px",
          marginLeft: "24px",
        },
      }),
    ],
    hidden: [check("body > .tarjeta", { count: 1, text: "Contenido de la tarjeta" })],
  },
  {
    slug: "html-5-2",
    title: "Borde redondeado",
    prompt:
      "A la clase .tarjeta ponele un borde de 2px, continuo (solid) y de color azul marino (navy), con las esquinas redondeadas de 8px.",
    starterCode:
      '<style>\n  .tarjeta {\n    padding: 12px;\n    /* agregá el borde y las esquinas */\n  }\n</style>\n\n<div class="tarjeta">Una tarjeta con borde</div>\n',
    rewardXp: 20,
    hint: "El borde se escribe en una sola línea: border: 2px solid navy; y las esquinas se redondean con border-radius: 8px;",
    solution:
      '<style>\n  .tarjeta { padding: 12px; border: 2px solid navy; border-radius: 8px; }\n</style>\n\n<div class="tarjeta">Una tarjeta con borde</div>',
    wrong: ['<style>.tarjeta { padding: 12px; border: 2px solid navy; }</style><div class="tarjeta">Una tarjeta con borde</div>'],
    visible: [
      check(".tarjeta", {
        count: 1,
        styles: {
          borderTopWidth: "2px",
          borderTopStyle: "solid",
          borderTopColor: "rgb(0, 0, 128)",
          borderTopLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        },
      }),
    ],
    hidden: [
      check(".tarjeta", {
        styles: {
          borderRightWidth: "2px",
          borderBottomColor: "rgb(0, 0, 128)",
          borderTopRightRadius: "8px",
          borderBottomLeftRadius: "8px",
        },
      }),
    ],
  },
  {
    slug: "html-5-3",
    title: "Ancho fijo y centrado",
    prompt:
      "Hacé que la caja .caja mida 300px de ancho y quede centrada horizontalmente en la página. Para centrarla, usá márgenes automáticos a izquierda y derecha.",
    starterCode:
      '<style>\n  .caja {\n    background: #cde;\n    height: 80px;\n    /* agregá el ancho y el centrado */\n  }\n</style>\n\n<div class="caja"></div>\n',
    rewardXp: 20,
    hint: "Un bloque con ancho definido se centra repartiendo el espacio sobrante en partes iguales: width: 300px; margin: 0 auto;",
    solution: '<style>\n  .caja { background: #cde; height: 80px; width: 300px; margin: 0 auto; }\n</style>\n\n<div class="caja"></div>',
    alternatives: ['<style>.caja { background: #cde; height: 80px; width: 300px; margin-left: auto; margin-right: auto; }</style><div class="caja"></div>'],
    wrong: ['<style>.caja { background: #cde; height: 80px; margin: 0 auto; }</style><div class="caja"></div>', '<style>.caja { background: #cde; height: 80px; width: 300px; }</style><div class="caja"></div>'],
    visible: [check(".caja", { count: 1, styles: { width: "300px", marginLeft: "242px", marginRight: "242px" } })],
    hidden: [check(".caja", { rects: [{ x: 250, y: 8, width: 300, height: 80 }] })],
  },
];

// ─── Unidad 6: Flexbox (20 XP) ──────────────────────────────────────────────
const SQUARE = (x: number, y = 8) => ({ x, y, width: 100, height: 50 });
const flex: HtmlExercise[] = [
  {
    slug: "html-6-1",
    title: "Elementos en fila",
    prompt:
      "Hoy los tres cuadrados están uno debajo del otro. Usá Flexbox en el contenedor .fila para que queden uno al lado del otro, en una fila.",
    starterCode:
      '<style>\n  .fila div {\n    width: 100px;\n    height: 50px;\n    background: steelblue;\n  }\n  /* escribí la regla de .fila acá */\n</style>\n\n<div class="fila">\n  <div></div>\n  <div></div>\n  <div></div>\n</div>\n',
    rewardXp: 20,
    hint: "Flexbox se activa en el contenedor (el padre), no en los hijos: .fila { display: flex; }",
    solution:
      '<style>\n  .fila div { width: 100px; height: 50px; background: steelblue; }\n  .fila { display: flex; }\n</style>\n\n<div class="fila"><div></div><div></div><div></div></div>',
    wrong: ['<style>.fila div { width: 100px; height: 50px; background: steelblue; display: flex; }</style><div class="fila"><div></div><div></div><div></div></div>'],
    visible: [check(".fila > div", { count: 3, rects: [SQUARE(8), SQUARE(108), SQUARE(208)] })],
    hidden: [check(".fila", { styles: { display: "flex" } })],
  },
  {
    slug: "html-6-2",
    title: "Centrar un elemento en la caja",
    prompt:
      "Dentro de la caja gris (.caja) hay un cuadrado (.punto). Con Flexbox, centralo horizontal y verticalmente dentro de la caja.",
    starterCode:
      '<style>\n  .caja {\n    width: 400px;\n    height: 200px;\n    background: #e5e7eb;\n    /* agregá Flexbox acá */\n  }\n  .punto {\n    width: 50px;\n    height: 50px;\n    background: tomato;\n  }\n</style>\n\n<div class="caja">\n  <div class="punto"></div>\n</div>\n',
    rewardXp: 20,
    hint: "En el contenedor activá display: flex y usá justify-content: center para el eje horizontal y align-items: center para el vertical.",
    solution:
      '<style>\n  .caja { width: 400px; height: 200px; background: #e5e7eb; display: flex; justify-content: center; align-items: center; }\n  .punto { width: 50px; height: 50px; background: tomato; }\n</style>\n\n<div class="caja"><div class="punto"></div></div>',
    alternatives: [
      '<style>.caja { width: 400px; height: 200px; background: #e5e7eb; display: flex; }\n.punto { width: 50px; height: 50px; background: tomato; margin: auto; }</style><div class="caja"><div class="punto"></div></div>',
    ],
    wrong: [
      '<style>.caja { width: 400px; height: 200px; background: #e5e7eb; display: flex; justify-content: center; }\n.punto { width: 50px; height: 50px; background: tomato; }</style><div class="caja"><div class="punto"></div></div>',
    ],
    visible: [check(".punto", { count: 1, rects: [{ x: 183, y: 83, width: 50, height: 50 }] })],
    hidden: [check(".caja", { rects: [{ x: 8, y: 8, width: 400, height: 200 }] })],
  },
  {
    slug: "html-6-3",
    title: "Distribuir con space-between",
    prompt:
      "Repartí los tres cuadrados dentro de .fila (que mide 400px de ancho) usando Flexbox: el primero tiene que quedar pegado al borde izquierdo, el último al derecho y el espacio que sobra se reparte en partes iguales entre ellos.",
    starterCode:
      '<style>\n  .fila {\n    width: 400px;\n    /* agregá Flexbox acá */\n  }\n  .fila div {\n    width: 50px;\n    height: 50px;\n    background: seagreen;\n  }\n</style>\n\n<div class="fila">\n  <div></div>\n  <div></div>\n  <div></div>\n</div>\n',
    rewardXp: 20,
    hint: "Además de display: flex, la propiedad justify-content tiene un valor que hace exactamente esto: space-between.",
    solution:
      '<style>\n  .fila { width: 400px; display: flex; justify-content: space-between; }\n  .fila div { width: 50px; height: 50px; background: seagreen; }\n</style>\n\n<div class="fila"><div></div><div></div><div></div></div>',
    wrong: [
      '<style>.fila { width: 400px; display: flex; justify-content: space-around; }\n.fila div { width: 50px; height: 50px; background: seagreen; }</style><div class="fila"><div></div><div></div><div></div></div>',
    ],
    visible: [
      check(".fila > div", {
        count: 3,
        rects: [
          { x: 8, y: 8, width: 50, height: 50 },
          { x: 183, y: 8, width: 50, height: 50 },
          { x: 358, y: 8, width: 50, height: 50 },
        ],
      }),
    ],
    hidden: [check(".fila", { styles: { display: "flex", justifyContent: "space-between" } })],
  },
];

export const units: HtmlUnit[] = [
  { slug: "html-css-fundamentos-u1-estructura", title: "Estructura", exercises: estructura },
  { slug: "html-css-fundamentos-u2-listas", title: "Texto y listas", exercises: listas },
  { slug: "html-css-fundamentos-u3-enlaces", title: "Enlaces e imágenes", exercises: enlaces },
  { slug: "html-css-fundamentos-u4-selectores", title: "Selectores y colores", exercises: selectores },
  { slug: "html-css-fundamentos-u5-caja", title: "Modelo de caja", exercises: caja },
  { slug: "html-css-fundamentos-u6-flexbox", title: "Flexbox", exercises: flex },
];

export async function seedHtmlCourse() {
  const toCase = (checks: Check[], isHidden: boolean) => ({
    input: null,
    expectedOutput: expectedOutputOf(checks),
    isHidden,
    compareMode: "dom",
    spec: { measure: checks.map((c) => c.query) } as unknown as import("@prisma/client").Prisma.InputJsonValue,
  });
  const toSpec = (e: HtmlExercise): SeedExerciseSpec => ({
    slug: e.slug,
    title: e.title,
    prompt: e.prompt,
    starterCode: e.starterCode,
    rewardXp: e.rewardXp,
    hint: e.hint,
    testCases: [toCase(e.visible, false), toCase(e.hidden, true)],
  });
  const spec: SeedCourseSpec = {
    ...COURSE,
    language: "html",
    units: units.map((u) => ({ slug: u.slug, title: u.title, exercises: u.exercises.map(toSpec) })),
  };
  await upsertCourse(spec);
  console.log("Seed del curso de HTML y CSS completado.");
}

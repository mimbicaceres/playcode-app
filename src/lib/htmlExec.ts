// Ejecutor de ejercicios de HTML y CSS: renderiza el codigo del alumno en un
// iframe aislado y MIDE el DOM resultante (elementos, texto, atributos, estilos
// calculados y posiciones). Nunca decide si el alumno aprobo: devuelve las
// mediciones como JSON y el servidor las compara con las esperadas (modo "dom"
// en server/src/lib/codeGrader.ts).
//
// IMPORTANTE: htmlExec es una funcion AUTOCONTENIDA (no usa imports ni
// variables externas) porque se inyecta tal cual en un navegador real desde
// server/scripts/verifyHtmlCourse.ts. Mantenerla asi.

export interface DomQuery {
  selector: string;
  // Cantidad de elementos que coinciden con el selector.
  count?: boolean;
  // Texto (espacios normalizados) del primer elemento / de todos ellos.
  text?: boolean;
  texts?: boolean;
  // true si el primer elemento tiene texto no vacio (para consignas de texto libre).
  hasText?: boolean;
  // Atributos del primer elemento / de todos ellos (valor tal como se escribio).
  attrs?: string[];
  attrsAll?: string[];
  // Estilos calculados (getComputedStyle, nombres en camelCase) del primer elemento / de todos.
  styles?: string[];
  stylesAll?: string[];
  // Posicion y tamano {x, y, width, height} redondeados, de todos los elementos.
  rects?: boolean;
}

// Tamano fijo del "navegador" donde se renderiza, para que las posiciones y los
// anchos calculados no dependan de la ventana del alumno.
export const HTML_VIEWPORT = { width: 800, height: 1500 };

// Devuelve, por cada grupo de consultas, el JSON (string) con sus mediciones.
export async function htmlExec(code: string, groups: DomQuery[][], viewport: { width: number; height: number }): Promise<string[]> {
  const frame = document.createElement('iframe');
  // Sin allow-scripts: el JavaScript del alumno no se ejecuta. allow-same-origin
  // solo sirve para que esta pagina pueda leer el DOM del iframe.
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.style.cssText = `position:fixed;left:-10000px;top:0;border:0;visibility:hidden;width:${viewport.width}px;height:${viewport.height}px`;
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve) => {
      frame.onload = () => resolve();
      // Si algun recurso externo tarda, seguimos igual: el DOM ya esta armado.
      setTimeout(() => resolve(), 3000);
      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"></head><body>${code}</body></html>`;
    });
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) throw new Error('No se pudo renderizar la página.');

    const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
    const styleOf = (el: Element, props: string[]) => {
      const cs = win.getComputedStyle(el) as unknown as Record<string, string>;
      const out: Record<string, string> = {};
      for (const p of props) out[p] = cs[p];
      return out;
    };

    return groups.map((queries) =>
      JSON.stringify(
        queries.map((q) => {
          const els = Array.from(doc.querySelectorAll(q.selector));
          const first = els[0];
          const res: Record<string, unknown> = { selector: q.selector };
          if (q.count) res.count = els.length;
          if (q.text) res.text = first ? norm(first.textContent) : null;
          if (q.texts) res.texts = els.map((e) => norm(e.textContent));
          if (q.hasText) res.hasText = !!first && norm(first.textContent).length > 0;
          if (q.attrs) {
            const out: Record<string, string | null> = {};
            for (const a of q.attrs) out[a] = first ? first.getAttribute(a) : null;
            res.attrs = out;
          }
          if (q.attrsAll) {
            const out: Record<string, (string | null)[]> = {};
            for (const a of q.attrsAll) out[a] = els.map((e) => e.getAttribute(a));
            res.attrsAll = out;
          }
          if (q.styles) res.styles = first ? styleOf(first, q.styles) : null;
          if (q.stylesAll) {
            const out: Record<string, string[]> = {};
            for (const p of q.stylesAll) out[p] = els.map((e) => styleOf(e, [p])[p]);
            res.stylesAll = out;
          }
          if (q.rects) {
            res.rects = els.map((e) => {
              const r = e.getBoundingClientRect();
              return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
            });
          }
          return res;
        }),
      ),
    );
  } finally {
    frame.remove();
  }
}

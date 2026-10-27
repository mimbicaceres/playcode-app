import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Contrasenas iniciales de los usuarios del seed. NUNCA van en el repositorio:
// viven en `usuarios-iniciales.txt` (raiz del proyecto, ignorado por git).
//
//  - Si el archivo existe (p. ej. te lo paso un companero), el seed usa las
//    contrasenas que ya trae, asi todo el equipo entra con las mismas.
//  - Si falta el usuario, se genera una contrasena aleatoria y se agrega al
//    archivo, para poder entregarsela a la persona.
//
// Formato legible y a la vez parseable: cada usuario es un bloque con lineas
// "Correo: ..." y "Contraseña: ...".

const FILE = process.env.USERS_FILE ?? path.resolve(__dirname, "../../../usuarios-iniciales.txt");

// Sin caracteres ambiguos (0/O, 1/l/I) para que se puedan dictar o copiar a mano.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generatePassword(length = 12): string {
  return Array.from(crypto.randomBytes(length), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function readCredentials(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(FILE)) return map;
  let email: string | null = null;
  for (const line of fs.readFileSync(FILE, "utf8").split(/\r?\n/)) {
    const mail = /^\s*Correo:\s*(\S+)/.exec(line);
    if (mail) {
      email = mail[1].toLowerCase();
      continue;
    }
    const pass = /^\s*Contraseña:\s*(\S+)/.exec(line);
    if (pass && email) {
      map.set(email, pass[1]);
      email = null;
    }
  }
  return map;
}

export interface NewCredential {
  name: string;
  email: string;
  password: string;
  role: string;
  detail?: string;
}

export function appendCredentials(entries: NewCredential[]) {
  if (entries.length === 0) return;
  const header = fs.existsSync(FILE)
    ? ""
    : "USUARIOS INICIALES - SOLO LOCAL (ignorado por git, no subir ni commitear)\n";
  const blocks = entries.map((e) =>
    [`\n${e.name} (${e.role})`, `  Correo:      ${e.email}`, `  Contraseña:  ${e.password}`, ...(e.detail ? [`  ${e.detail}`] : [])].join("\n"),
  );
  fs.appendFileSync(FILE, `${header}${blocks.join("\n")}\n`, "utf8");
}

export const credentialsFile = FILE;

# CODIX

Plataforma de aprendizaje de programación. El front (Vite + React) está en la raíz y la API (Express + Prisma + PostgreSQL) en `server/`.

Esta guía deja a cualquiera con **la misma base de datos que el resto del equipo**: mismos cursos, mismos usuarios y mismo avance.

## Requisitos

- Node 20 o superior (probado con Node 24) y npm.
- PostgreSQL instalado y corriendo en tu máquina.
- Git.
- Opcional: Chrome o Edge, solo para `npm run verify:html-course`.

## Primera vez (después de clonar o del primer `git pull`)

**1. Creá una base de datos vacía** en PostgreSQL, por ejemplo:

```bash
createdb codix_db        # o desde pgAdmin: "Create > Database"
```

**2. Instalá las dependencias** (son dos `package.json`):

```bash
npm install              # front, en la raíz
cd server
npm install              # API
```

**3. Configurá `server/.env`** a partir del ejemplo (este archivo NO se sube a git):

```bash
cp .env.example .env
```

Editá `DATABASE_URL` con tu usuario y contraseña de PostgreSQL (`postgresql://usuario:clave@localhost:5432/codix_db`) y poné en `JWT_SECRET` cualquier texto largo y aleatorio. El `.env.example` de la raíz es de otra plantilla y no hace falta.

**4. Pedí `usuarios-iniciales.txt` y copialo a la raíz del proyecto, ANTES del paso 6.**
Tiene el nombre, correo y contraseña de cada usuario de ejemplo. No está en git a propósito (contiene contraseñas). Si no lo copiás, el seed genera contraseñas aleatorias distintas a las del resto del equipo y las anota en un archivo nuevo.

**5. Creá las tablas:**

```bash
npx prisma migrate dev
```

**6. Cargá los datos:**

```bash
npm run db:seed
```

**7. Levantá los dos servidores** (cada uno en su terminal):

```bash
npm run dev              # en server/  → API en http://localhost:4000
npm run dev              # en la raíz  → app en http://localhost:3000
```

**8. Entrá** en http://localhost:3000/login con cualquier usuario de `usuarios-iniciales.txt`. Las tres cuentas de desarrollo (`admin@ejemplo.com`, `docente@ejemplo.com`, `estudiante@ejemplo.com`) usan la contraseña `password123`.

## Cada vez que hagas `git pull` más adelante

```bash
npm install                  # raíz y server, por si cambió algún package.json
cd server
npx prisma migrate dev       # aplica migraciones nuevas
npm run db:seed              # actualiza cursos y datos
```

Después reiniciá los dos servidores. Si `prisma generate` falla con `EPERM`, es porque un servidor tiene abierto el motor de Prisma: cerralos y repetí.

## Qué tiene cada uno después del seed

| Qué | Cantidad |
|---|---|
| Cursos reales | Python — Fundamentos (48 ejercicios), JavaScript — Fundamentos (21), SQL: consultas con SQLite (20), HTML y CSS: Fundamentos (18) |
| Cursos del catálogo CODIX | `prog1`, `py2`, `java3`, `js_base`, `css_modern` (su contenido está en el front) |
| Usuarios | 3 cuentas de desarrollo, 1 admin, 4 docentes, 42 alumnos y `e2e.prueba@ejemplo.com` (alumno de prueba con los 4 cursos) |
| Datos | Asignaciones de cursos y progreso de cada alumno, para que los gráficos del admin tengan datos |

Todos los correos son ficticios (`@ejemplo.com`). El seed se puede correr cuantas veces haga falta: **no pisa nada**. Un usuario que ya existe no se modifica y el progreso solo se genera para quien todavía no tiene.

## Qué NO se comparte por git (y por qué puede haber diferencias)

- `server/.env`: configuración y secretos de cada máquina.
- `usuarios-iniciales.txt`: las contraseñas. Hay que pasarlo por fuera de git (mensaje directo, gestor de contraseñas, etc.). Se regenera con `npm run users:file`.
- Las fechas del progreso: se calculan "hace X días" respecto del momento en que corre el seed, así que cambian de máquina en máquina. Los porcentajes y las cantidades sí son los mismos.
- Cualquier cosa que alguien cree a mano desde la interfaz (cuentas registradas, cursos o asignaciones nuevas) vive solo en su base. **Si algo tiene que tenerlo todo el equipo, va al seed o a una migración y se sube a git.**

## Comandos útiles

Desde `server/`:

| Comando | Para qué sirve |
|---|---|
| `npm run db:seed` | Carga todo (cursos, usuarios, asignaciones, progreso). Idempotente. |
| `npm run users:file` | Regenera `usuarios-iniciales.txt` ordenado por rol y con el avance de cada alumno, para pasárselo al equipo. No cambia ninguna contraseña. |
| `npm run verify:js-course` / `verify:sql-course` | Comprueban que las soluciones de referencia de cada ejercicio aprueban y los errores típicos fallan. No tocan la base. |
| `npm run verify:html-course` | Igual, pero renderizando en Chrome o Edge real. |
| `npx tsx scripts/applyGradualProgress.ts <correo> <curso>=<N> ...` | Deja a un alumno con avance gradual (borra y recrea solo el progreso de ese alumno). |
| `npm run lint` | Chequeo de tipos (`tsc --noEmit`). También existe en la raíz. |

## Modo demo

Con una cuenta de administrador, el botón "Demo" de la barra abre `/demo`: un panel de ejemplo con datos de muestra que no se guarda en la base.

## Problemas frecuentes

- **`Can't reach database server`**: PostgreSQL no está corriendo o `DATABASE_URL` tiene mal el usuario, la clave, el puerto o el nombre de la base.
- **`EPERM` en `prisma generate`**: cerrá los servidores y repetí el comando.
- **El puerto 3000 o 4000 está ocupado**: hay otra copia corriendo; cerrala.
- **Quiero empezar de cero**: `npx prisma migrate reset` **borra toda la base** y la vuelve a crear. Usalo solo en tu base local.

## Pendiente

El curso de Java todavía no está cargado.

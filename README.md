# CODIX

Plataforma de aprendizaje de programación. Front (Vite + React) en la raíz, API (Express + Prisma + PostgreSQL) en `server/`.

## Después de un `git pull`

Requisitos: Node 20+ y un PostgreSQL local con una base vacía.

```bash
npm install                      # front
cd server
npm install                      # API
cp .env.example .env             # editar DATABASE_URL y JWT_SECRET
npx prisma migrate dev           # crea/actualiza las tablas
npm run db:seed                  # carga cursos (Python, JavaScript, SQL, HTML/CSS) y usuarios (idempotente)
npm run dev                      # API en :4000
```

En otra terminal, desde la raíz: `npm run dev` (front en http://localhost:3000).

El seed se puede correr cuantas veces haga falta: actualiza el contenido por `slug` sin duplicar. Los cursos viven en `server/prisma/seed-python-course.ts` y `server/prisma/seeds/`; la base local nunca es la fuente del contenido.

## Usuarios de ejemplo y contraseñas

`npm run db:seed` también crea la institución de ejemplo (Colegio San Martín): 42 alumnos, docentes, un admin y `e2e.prueba@ejemplo.com`, con cursos asignados y progreso. Todos usan correos `@ejemplo.com`.

Las contraseñas **no están en el repositorio**. Viven en `usuarios-iniciales.txt` (raíz, ignorado por git):

- Si ese archivo existe antes de correr el seed (por ejemplo, te lo pasa un compañero), se usan las contraseñas que trae.
- Si no existe, el seed genera contraseñas aleatorias y las anota ahí.

El seed no pisa nada: un usuario que ya existe no se modifica y el progreso solo se genera para quien todavía no tiene.

## Chequeos

`npm run lint` en la raíz y en `server/` (`tsc --noEmit`).

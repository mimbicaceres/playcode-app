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
npm run db:seed                  # carga usuarios y el curso de Python (idempotente)
npm run dev                      # API en :4000
```

En otra terminal, desde la raíz: `npm run dev` (front en http://localhost:3000).

El seed se puede correr cuantas veces haga falta: actualiza el contenido por `slug` sin duplicar. Los cursos viven en `server/prisma/seed-*.ts`; la base local nunca es la fuente del contenido.

## Chequeos

`npm run lint` en la raíz y en `server/` (`tsc --noEmit`).

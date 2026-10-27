# CODIX

Pasos para dejar el proyecto funcionando con los mismos datos que el resto del equipo. Seguilos en orden.

**Necesitás tener instalado:** Node.js 20 o superior (nodejs.org, versión LTS), PostgreSQL (postgresql.org; anotá la contraseña del usuario `postgres` que te pide al instalarlo) y Git.

**Terminales:** vas a usar dos carpetas. La **carpeta principal** es la que tiene `package.json` y este `README.md`; la **carpeta `server`** está adentro. Para abrir una terminal en una carpeta (Windows): abrila en el Explorador, hacé clic en la barra de direcciones, escribí `powershell` y apretá Enter.

## Primera vez

### 1. Conseguir el proyecto
En la carpeta donde quieras guardarlo:
```bash
git clone https://github.com/mimbicaceres/playcode-app.git
cd playcode-app
```
Si ya lo tenías, en la carpeta principal: `git pull`.

### 2. Crear una base de datos vacía
En pgAdmin: clic derecho en *Databases → Create → Database…*, nombre `codix_db`. (Con terminal: `createdb -U postgres codix_db`.)

### 3. Instalar dependencias
```bash
npm install          # carpeta principal
cd server
npm install          # carpeta server
```

### 4. Crear `server/.env`
En la carpeta `server`:
```bash
Copy-Item .env.example .env      # PowerShell   (macOS / Linux: cp .env.example .env)
```
Abrí **`.env`** (no `.env.example`, que se sube a git) y completá:
```
DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/codix_db?schema=public"
JWT_SECRET="un-texto-largo-y-aleatorio"
```
- `TU_CLAVE` es la contraseña de tu usuario `postgres`. Si tiene símbolos, escribilos codificados: `@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`.
- Para generar un `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Dejá `NODE_ENV=development`.

### 5. Copiar `usuarios-iniciales.txt`
Te lo pasa quien te compartió el proyecto (no viaja por git porque tiene contraseñas). Copialo a la **carpeta principal**, junto a `package.json`, **antes del paso 7**. Si no está, el seed inventa contraseñas distintas a las del equipo.

### 6. Crear las tablas
En la carpeta `server`:
```bash
npx prisma migrate dev
```
Termina con `Your database is now in sync with your schema`.

### 7. Cargar los datos
En la carpeta `server`:
```bash
npm run db:seed
```
Puede tardar hasta un minuto. Es seguro repetirlo.

### 8. Levantar la aplicación (dos terminales abiertas)
```bash
npm run dev          # terminal 1, carpeta server    → "Server listening on port 4000"
npm run dev          # terminal 2, carpeta principal → "Local: http://localhost:3000/"
```

### 9. Entrar
Abrí http://localhost:3000/login. Cuentas de desarrollo (contraseña `password123`): `admin@ejemplo.com`, `docente@ejemplo.com`, `estudiante@ejemplo.com`. El resto de los usuarios y sus contraseñas están en `usuarios-iniciales.txt`.

Para apagar todo: `Ctrl+C` en cada terminal.

## Después de cada `git pull`
```bash
git pull             # carpeta principal
npm install
cd server
npm install
npx prisma migrate dev
npm run db:seed
```
Reiniciá las dos terminales del paso 8.

## Si algo falla
- **`Can't reach database server`:** PostgreSQL apagado o `DATABASE_URL` mal escrito (usuario, clave, puerto o nombre de la base).
- **`P1000 Authentication failed` / `password authentication failed`:** `server/.env` todavía tiene `usuario` y `password`, o la clave es incorrecta o tiene símbolos sin codificar.
- **`EPERM` al migrar:** cerrá las dos terminales de la aplicación y repetí el comando.
- **Puerto 3000 o 4000 ocupado:** hay otra copia corriendo; cerrala.
- **`Refusing to seed … in production`:** `NODE_ENV` tiene que ser `development`.
- **Empezar de cero:** `npx prisma migrate reset` (carpeta `server`) **borra toda la base**. Usalo solo en tu base local.

# Fichero

Bitácora de comandos compartida. Backend en **Node.js + Express**, base de
datos **PostgreSQL**, frontend estático (sin frameworks). Pensado para
desplegarse en **Render** y compartirse entre varias personas con un código
de acceso simple.

## Estructura del proyecto

```
fichero-app/
├── server.js          # servidor Express + rutas de la API
├── db.js              # conexión a PostgreSQL y creación de la tabla
├── package.json
├── render.yaml         # blueprint para desplegar todo en Render de un clic
├── .env.example         # variables de entorno de ejemplo
└── public/
    └── index.html      # frontend (HTML + CSS + JS, sin build)
```

## 1. Correr el proyecto en tu computadora (opcional pero recomendado)

Necesitas Node.js 18 o más nuevo instalado.

```bash
cd fichero-app
npm install
cp .env.example .env
```

Edita `.env` y pon una `DATABASE_URL` real. Si no tienes Postgres local,
puedes saltarte esto y probar directo en Render (paso 3).

```bash
npm start
```

Abre `http://localhost:3000`.

## 2. Subir el proyecto a GitHub

Ya inicialicé el repositorio de Git localmente. Desde tu computadora:

```bash
cd fichero-app
git add .
git commit -m "Fichero: bitacora de comandos"
```

Crea un repositorio vacío en GitHub (sin README, sin .gitignore, para que no
choque con lo que ya tienes) y luego:

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/fichero.git
git push -u origin main
```

Cambia `TU-USUARIO` y el nombre del repo por los tuyos.

## 3. Desplegar en Render

### Opción A — con el blueprint (más rápido)

1. Entra a [render.com](https://render.com) y crea una cuenta (gratis).
2. Click en **New +** → **Blueprint**.
3. Conecta tu cuenta de GitHub y elige el repositorio `fichero`.
4. Render lee `render.yaml` y te propone crear automáticamente:
   - Un **Web Service** (el servidor Express).
   - Una **base de datos PostgreSQL** (`fichero-db`).
5. Te va a pedir el valor de `ACCESS_CODE` (la variable que marqué como
   secreta) — escribe el código que quieras compartir con tu amigo.
6. Click en **Apply**. Espera unos minutos mientras construye y despliega.
7. Cuando termine, Render te da una URL pública como
   `https://fichero.onrender.com`. Esa es la que compartes.

### Opción B — manual

1. **New +** → **PostgreSQL**. Dale un nombre, plan gratuito, créala.
2. Copia el **Internal Database URL** que te muestra.
3. **New +** → **Web Service** → conecta el repositorio `fichero`.
   - Build command: `npm install`
   - Start command: `npm start`
4. En **Environment**, agrega:
   - `DATABASE_URL` = el Internal Database URL que copiaste.
   - `ACCESS_CODE` = el código que van a usar tú y tu amigo.
5. Deploy. Cuando termine, tendrás tu URL pública.

> Nota: en el plan gratuito de Render, el servicio "se duerme" tras un rato
> sin uso y tarda unos 30-50 segundos en despertar con la primera visita.
> Es normal, no es un error.

## 4. Compartir con tu amigo

Envíale la URL de Render y el `ACCESS_CODE` que configuraste. La primera vez
que entre, la app le va a pedir ese código; a partir de ahí queda guardado en
su navegador y verá y guardará comandos en la misma base de datos que tú.

## Seguridad — léelo antes de compartir la URL

- El `ACCESS_CODE` es una protección **simple**, pensada para dos o tres
  personas de confianza. No es un sistema de usuarios real: cualquiera con
  el código puede leer, editar y borrar todo.
- No subas tu archivo `.env` a GitHub (ya está en `.gitignore`).
- Si más adelante quieres cuentas de usuario individuales, permisos por
  persona, o historial de cambios, dímelo y lo construimos sobre esta misma
  base.

## Endpoints de la API

| Método | Ruta                  | Descripción                     |
|--------|-----------------------|----------------------------------|
| GET    | `/api/commands`       | Lista todos los comandos        |
| POST   | `/api/commands`       | Crea un comando                 |
| PUT    | `/api/commands/:id`   | Actualiza un comando            |
| DELETE | `/api/commands/:id`   | Elimina un comando              |

Todas requieren el header `x-access-code` si configuraste `ACCESS_CODE`.

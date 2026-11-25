# Gestor de Entregas Académicas · aplicación base

Aplicación web **deliberadamente vulnerable** para la asignatura *Desarrollo de
Software Seguro*. La iremos **descubriendo y asegurando sesión a sesión**.

La primera intención no es arreglarla. Antes de corregir hay que aprender a mirar:
entender **por qué** ocurren las fallas y qué decisión las dejó entrar.

> ⚠️ **Uso exclusivamente académico.** Esta aplicación contiene fallas de
> seguridad a propósito. No la despliegues en internet ni la ejecutes en una
> red que no controles.

## Qué hace

Gestiona entregas académicas con tres roles: **ADMIN**, **PROFESOR** y **ALUMNO**.
Permite iniciar sesión, administrar usuarios, crear tareas, comentar, y subir y
descargar archivos de entrega.

## Requisitos

- **Node.js ≥ 24** (usa el módulo integrado `node:sqlite`; la versión está fijada
  en `.nvmrc`). Comprueba con `node --version`.
- No necesitas Docker, ni PostgreSQL, ni compiladores: la base de datos es un
  archivo SQLite que se crea solo.

## Arranque

```bash
npm install      # desde esta carpeta (dss-proyecto-base/)
npm run dev      # levanta API y cliente a la vez
```

- API: <http://localhost:4000/api> · salud en `/api/health`
- Cliente: <http://localhost:5173>

Otros comandos:

```bash
npm test          # ejecuta la suite de pruebas (Vitest + Supertest)
npm run db:reset  # reinicia la base de datos al estado inicial
```

## Integración continua

El repositorio trae un pipeline en `.github/workflows/ci.yml`: en cada push y en
cada Pull Request corre `npm test`.

## Estructura

```
dss-proyecto-base/
├── server/            API Express + node:sqlite
│   ├── src/
│   │   ├── app.js         montaje de Express, CORS, manejo de errores
│   │   ├── config.js      configuración de la aplicación
│   │   ├── auth.js        emisión y verificación del token de sesión
│   │   ├── db/            esquema y datos de ejemplo
│   │   ├── middleware/    autenticación
│   │   └── routes/        auth · users · tasks · files
│   └── tests/         suite de pruebas
└── client/            React + Vite
    └── src/           App.jsx · api.js
```

## Actividad #12: HTTPS y Sesión (SEC-02 y SEC-17)

### Controles Implementados
- **SEC-02 (Firma HMAC de Sesión):** Tokens firmados con HMAC-SHA256 (`crypto.createHmac`) y clave secreta del servidor (`APP_SECRET`). Comparación en tiempo constante con `crypto.timingSafeEqual` para mitigar ataques de tiempo. Control de invalidación por versión con `token_version` en la base de datos.
- **CWE-613 (Expiración de Sesión):** Endpoint `POST /api/auth/logout` que incrementa `token_version` del usuario en SQLite, revocando inmediatamente todos los tokens previos emitidos.
- **SEC-17 (Cookie Segura):** Migración de almacenamiento del token de `localStorage` a Cookie HTTP con atributos `HttpOnly`, `Secure` y `SameSite=Strict`.

### Deuda Técnica Declarada
1. **HTTPS en producción:** Requiere certificado emitido por Autoridad Certificadora reconocida (Let's Encrypt) y encabezado `Strict-Transport-Security` (HSTS).
2. **Duración de sesión:** La cookie tiene expiración fija de 2 horas (`maxAge: 7200000`); queda pendiente renovación deslizante (*sliding session*) y cierre por inactividad (OWASP Session Management).
3. **Intentos de login:** Pendiente control de tasa de intentos (*Rate Limiting* / SEC-03).
4. **Dependencia vulnerable:** `jsonwebtoken 8.5.1` permanece en dependencias pendiente de actualización (SEC-16).

### Declaración de Uso de Inteligencia Artificial
En el desarrollo de esta actividad se utilizó asistencia de Inteligencia Artificial con los siguientes alcances:
1. **Redacción y Documentación:** Asistencia en la formulación y redacción explicativa del reporte técnico y resumen conceptual de los controles.
2. **Diseño de Pruebas de Regresión:** Apoyo en la estructura e implementación de las pruebas automatizadas en Vitest (`server/tests/regresion-sec02.test.js` y adaptación de pruebas existentes con `tokenDe`).
3. **Modelado y Diagrama Criptográfico:** Elaboración del diagrama de arquitectura y flujo de verificación de firmas criptográficas para la solución de SEC-02.

**Equipo:**
- Pedro Díaz
- Esteban Priego

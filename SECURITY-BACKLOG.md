# Security Backlog · Gestor de Entregas Académicas

Registro formal consolidado de debilidades y vulnerabilidades de seguridad identificadas en la aplicación, priorizadas según su nivel de riesgo como plan integral de aseguramiento de software.

---

## 1. Regla de Derivación de Severidad (Matriz de Riesgo)

La severidad se calculó cruzando la **Probabilidad de Explotación** frente al **Impacto en el Negocio** (Confidencialidad, Integridad y Disponibilidad):

| Probabilidad \ Impacto | Alto | Medio | Bajo |
| :--- | :---: | :---: | :---: |
| **Alta** | **Crítica** | **Alta** | **Media** |
| **Media** | **Alta** | **Media** | **Baja** |
| **Baja** | **Media** | **Baja** | **Baja** |

---

## 2. Tabla Consolidada de Hallazgos (Plan Integral de Seguridad)

| ID | Hallazgo | Severidad | Estado | Commit y Prueba | Lo que falta / Mitigación aplicada |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **SEC-01** | **Contraseñas almacenadas en texto plano** *(CWE-256 / OWASP A02)* | **Crítica** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Cifrar contraseñas con hashing adaptativo y sal (`argon2id` o `bcrypt`). Eliminar contraseñas en respuestas de la API. |
| **SEC-02** | **Token de sesión falsificable en Base64 sin firma** *(CWE-345 / OWASP A07)* | **Crítica** | Abierto *(Deuda técnica)* | PoC: [`sec02.test.js`](server/tests/sec02.test.js)<br/>*(Commit `78484c6`)* | **Falta:** Reemplazar el Base64 plano por tokens criptográficos firmados (JWT con HMAC-SHA256) o cookies `HttpOnly` y `Secure`. |
| **SEC-03** | **Fuerza bruta en login sin limitador de intentos** *(CWE-307 / OWASP A07)* | **Alta** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Implementar limitador de tasa (`express-rate-limit`) o bloqueo temporal de cuenta tras $N$ intentos fallidos. |
| **SEC-04** | **Control de acceso por roles / Alumno administra usuarios** *(CWE-285 / OWASP A01)* | **Crítica** | **Cerrado** | Commit `367bab3`<br/>[`sec04.test.js`](server/tests/sec04.test.js) | **Mitigado:** Se aplicó el middleware `requireRole('ADMIN')` en `users.routes.js:13`. Alumnos reciben `403 Forbidden`. |
| **SEC-05** | **Elevación vertical de privilegios por asignación masiva** *(CWE-915 / CWE-269)* | **Crítica** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Validar esquemas en `PATCH /api/users/:id` y prohibir explícitamente a usuarios comunes modificar el atributo `role`. |
| **SEC-06** | **Control de pertenencia / IDOR en borrado de tarea ajena** *(CWE-639 / OWASP A01)* | **Alta** | **Cerrado** | Commit `1aac7e6`<br/>[`sec06.test.js`](server/tests/sec06.test.js) | **Mitigado:** Se implementó `requireOwnership(cargarTarea)` en `tasks.routes.js:71`. Valida que `created_by === req.user.id` o rol `ADMIN`; rechaza con `403 Forbidden`. |
| **SEC-07** | **Inyección SQL en búsqueda de tareas** *(CWE-89 / OWASP A03)* | **Crítica** | **Cerrado** | Commit `c5b4d85`<br/>[`sec07.test.js`](server/tests/sec07.test.js) | **Mitigado:** Se sustituyó la concatenación `${q}` por consultas parametrizadas con marcadores `?` en `tasks.routes.js:28-31` y se eliminó el campo de depuración `sql`. |
| **SEC-08** | **Falta de validación y sanitización en esquemas de entrada** *(CWE-20 / OWASP A04)* | **Media** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Integrar validación estricta de esquemas (Zod / Joi) para tipos de datos, longitudes y formatos en cuerpos JSON recibidos. |
| **SEC-09** | **Inyección XSS almacenado en comentarios** *(CWE-79 / OWASP A03)* | **Crítica** | Abierto *(Deuda técnica)* | Demostrado en vivo<br/>*(PoC manual)* | **Falta:** En frontend (`App.jsx:63`), eliminar `dangerouslySetInnerHTML` en favor de texto plano `{c.body}` o sanitizar con `DOMPurify`. |
| **SEC-10** | **Subida de archivos sin validación de tipo ni tamaño** *(CWE-434 / OWASP A04)* | **Alta** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Configurar `fileFilter` en Multer con inspección de Magic Bytes (`file-type`), límite estricto de 5 MB y renombrado con UUID. |
| **SEC-11** | **Path Traversal en descarga de archivos** *(CWE-22 / OWASP A01)* | **Crítica** | **Cerrado** | Commit `50e1846`<br/>[`regresion-sec11.test.js`](server/tests/regresion-sec11.test.js) | **Mitigado:** Se eliminó la concatenación insegura con `path.join`; ahora se normaliza la ruta con `path.resolve` y se verifica `target.startsWith(uploadRoot + sep)`. Responde `404 Not Found`. |
| **SEC-12** | **Fuga de información y trazas de pila en errores 500** *(CWE-209 / OWASP A05)* | **Media** | **Cerrado** | Commit `1aac7e6`<br/>[`regresion-sec12.test.js`](server/tests/regresion-sec12.test.js) | **Mitigado:** Manejador global en `app.js:36-39` envía el `stack` exclusivamente a la consola interna y responde al cliente `{"error": "Error interno"}`. |
| **SEC-13** | **Configuración permisiva de CORS con reflejo ciego** *(CWE-942 / OWASP A05)* | **Alta** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Configurar lista blanca explícita de dominios de confianza en `cors({ origin: [...] })` en lugar de reflejo ciego con `cb(null, true)`. |
| **SEC-14** | **Secretos en código fuente y archivo .env en Git** *(CWE-798 / OWASP A05)* | **Alta** | **Cerrado** | Commits `409cc3f`, `814596b`<br/>[`regresion-sec14.test.js`](server/tests/regresion-sec14.test.js) | **Mitigado:** Secretos desacoplados a `process.env` en `config.js`, `.env` excluido en `.gitignore` y plantilla `.env.example` pública. *(Deuda residual: rotación de credenciales históricas).* |
| **SEC-15** | **Ausencia de registros estructurados y auditoría de eventos** *(CWE-778 / OWASP A09)* | **Baja** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Implementar logging estructurado centralizado (Winston / Pino) para registrar con timestamp IP, usuario y acciones críticas. |
| **SEC-16** | **Uso de dependencias desactualizadas con vulnerabilidades** *(CWE-1104 / OWASP A06)* | **Media** | Abierto *(Deuda técnica)* | `npm audit` / `eslint-plugin-security` | **Falta:** Actualizar dependencias vulnerables (`lodash: 4.17.20` por Prototype Pollution, `jsonwebtoken: 8.5.1` y `multer: 1.4.4`). |
| **SEC-17** | **Tráfico sin cifrado HTTP y almacenamiento inseguro de sesión** *(CWE-319 / CWE-522)* | **Alta** | Abierto *(Deuda técnica)* | `N/A` | **Falta:** Forzar HTTPS mediante TLS y migrar el almacenamiento del token de `localStorage` a cookies seguras con banderas `HttpOnly`, `Secure` y `SameSite`. |

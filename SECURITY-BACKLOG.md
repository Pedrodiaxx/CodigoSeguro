# Security Backlog · Gestor de Entregas Académicas

Registro formal de debilidades y vulnerabilidades de seguridad identificadas en la aplicación base del curso (*Desarrollo de Software Seguro*), priorizadas según su nivel de riesgo como plan de trabajo para las Unidades II y III.

---

## 📐 Regla de Derivación de Severidad (Matriz de Riesgo)

La severidad de cada hallazgo se determina evaluando la **Probabilidad de Explotación** (qué tan fácil y accesible es descubrir y ejecutar el ataque) frente al **Impacto en el Sistema** (daño causado a la Confidencialidad, Integridad y Disponibilidad):

| Probabilidad \ Impacto | Alto | Medio | Bajo |
| :--- | :---: | :---: | :---: |
| **Alta** | 🔴 **Crítica** | 🟠 **Alta** | 🟡 **Media** |
| **Media** | 🟠 **Alta** | 🟡 **Media** | 🟢 **Baja** |
| **Baja** | 🟡 **Media** | 🟢 **Baja** | 🟢 **Baja** |

### Criterios de Clasificación:
- 🔴 **Crítica (Alta + Alto):** Vulnerabilidad directamente explotable que permite el control administrativo total, ejecución de código, inyección directa en base de datos o suplantación masiva de usuarios.
- 🟠 **Alta (Alta + Medio / Media + Alto):** Vulnerabilidad con impacto severo en la privacidad o control de recursos (fuerza bruta, bypass de sesión, robo de archivos o secretos expuestos).
- 🟡 **Media (Alta + Bajo / Media + Medio / Baja + Alto):** Fallas de sanitización de esquemas, fuga de trazas técnicas o dependencias con riesgo moderado.
- 🟢 **Baja (Media + Bajo / Baja + Bajo):** Falta de mecanismos defensivos o de trazabilidad (auditoría/logs) que no provocan una brecha por sí mismos pero dificultan la detección forense.

---

## 📋 Lista de Hallazgos Ordenada por Severidad (Plan de Trabajo)

| ID | CIA | Prob. | Impacto | Severidad | Debilidad | Dónde | Cómo lo detecté | Qué debería pasar |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **SEC-05** | Integridad / Confidencialidad | Alta | Alto | 🔴 **Crítica** | **Un alumno se hace administrador solo** *(CWE-915 / CWE-269)* | [`server/src/routes/users.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/users.routes.js#L37-L49) | Envío de `PATCH /api/users/4` con `{ "role": "ADMIN" }` desde token de alumno; el servidor devolvió `200 OK` elevando privilegios. | Prohibir a usuarios comunes modificar el campo `role` y validar autorización estricta en operaciones de actualización de perfil. |
| **SEC-02** | Confidencialidad / Integridad | Alta | Alto | 🔴 **Crítica** | **El token se puede leer y fabricar a mano** *(CWE-345 / OWASP A07)* | [`server/src/auth.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/auth.js#L5-L23) | Decodificación del token con `atob(localStorage.getItem('token'))` (`id:username`). Se forjó identidad de admin con `btoa('1:admin')` sin clave. | Implementar tokens criptográficamente firmados e inviolables (como JWT con HMAC-SHA256) o cookies de sesión firmadas con `HttpOnly`. |
| **SEC-07** | Confidencialidad / Integridad | Alta | Alto | 🔴 **Crítica** | **La búsqueda se rompe con comillas o símbolos** *(CWE-89 / OWASP A03)* | [`server/src/routes/tasks.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/tasks.routes.js#L22-L30) | Inyección SQL con `q=' OR '1'='1` en Thunder Client; devolvió tareas confidenciales y expuso la consulta SQL interna en el JSON. | Las consultas deben parametrizarse con marcadores de posición (`WHERE title LIKE ?`), evitando concatenar o interpolar cadenas con `${...}`. |
| **SEC-01** | Confidencialidad | Alta | Alto | 🔴 **Crítica** | **Las contraseñas se guardan sin proteger** *(CWE-256 / OWASP A02)* | [`server/src/auth.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/auth.js#L28) y [`server/src/db/index.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/db/index.js#L30) | Inspección de `findUserByCredentials` (`user.password !== password`) y visualización de contraseñas en texto claro en pestaña "Usuarios" del cliente. | Cifrar contraseñas con algoritmos de hashing adaptativo y sal (ej. `argon2id` o `bcrypt`). Nunca guardarlas en texto plano ni devolverlas en la API. |
| **SEC-11** | Confidencialidad | Alta | Alto | 🔴 **Crítica** | **Se descarga un archivo de fuera de la carpeta** *(CWE-22 / OWASP A01)* | [`server/src/routes/files.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/files.routes.js#L38-L46) | Petición `GET /api/files/raw?name=../../package.json` en Thunder Client; el servidor devolvió el código del archivo fuera del directorio `uploads/`. | Normalizar rutas con `path.resolve`, rechazar secuencias relativas `..` y validar que el archivo resida obligatoriamente dentro de `uploadRoot`. |
| **SEC-09** | Confidencialidad / Integridad | Alta | Alto | 🔴 **Crítica** | **Un comentario mete código que se ejecuta** *(CWE-79 / OWASP A03)* | [`client/src/App.jsx`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/client/src/App.jsx#L63) y [`server/src/routes/tasks.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/tasks.routes.js#L91-L100) | Envío del comentario `<img src="x" onerror="alert('Vulnerable a XSS')" />`; al visualizar la tarea, React ejecutó el script por `dangerouslySetInnerHTML`. | No usar `dangerouslySetInnerHTML` para contenido de usuarios; sanitizar entradas y salidas con librerías como DOMPurify y escapar caracteres especiales. |
| **SEC-04** | Integridad / Confidencialidad | Alta | Alto | 🔴 **Crítica** | **Cualquier usuario logueado administra a todos** *(CWE-285 / OWASP A01)* | [`server/src/routes/users.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/users.routes.js#L8-L56) | El router solo aplica `requireAuth`. Un `ALUMNO` puede listar usuarios (`GET /`), crear cuentas (`POST /`) o eliminar usuarios (`DELETE /:id`). | Implementar middleware de autorización basado en roles (RBAC) tipo `requireRole('ADMIN')` para proteger todas las rutas administrativas. |
| **SEC-06** | Confidencialidad / Integridad | Alta | Medio | 🟠 **Alta** | **Puedes ver o tocar lo de otros usuarios** *(CWE-639 / OWASP A01)* | [`server/src/routes/files.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/files.routes.js#L49-L58) y [`tasks.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/tasks.routes.js#L51-L74) | Un alumno (`alumno2`, ID 5) descargó archivos de otro alumno (`alumno`, ID 4) mediante `/api/files/1/download` sin control de autoría (IDOR). | Validar propiedad a nivel de objeto (`file.owner_id === req.user.id` o rol `PROFESOR`/`ADMIN`) antes de permitir lectura, modificación o borrado. |
| **SEC-10** | Integridad / Disponibilidad | Alta | Medio | 🟠 **Alta** | **Se sube cualquier archivo, de cualquier tamaño** *(CWE-434 / OWASP A04)* | [`server/src/routes/files.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/files.routes.js#L13-L30) | Configuración de Multer sin `fileFilter` ni `limits.fileSize`. Permite subir ejecutables (.exe), scripts maliciosos o archivos de tamaño excesivo. | Definir lista blanca estricta de tipos MIME y extensiones aceptadas, junto con un límite estricto de tamaño de archivo (ej. máx 5 MB). |
| **SEC-03** | Confidencialidad / Disponibilidad | Alta | Medio | 🟠 **Alta** | **Se prueba la contraseña sin límite de intentos** *(CWE-307 / OWASP A07)* | [`server/src/routes/auth.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/auth.routes.js#L8-L25) | Envío masivo de peticiones de login con credenciales erróneas en Thunder Client; el servidor responde indefinidamente sin bloquear intentos. | Implementar limitación de tasa (Rate Limiting con `express-rate-limit`), retraso progresivo o bloqueo temporal tras N intentos fallidos. |
| **SEC-14** | Confidencialidad | Media | Alto | 🟠 **Alta** | **Hay contraseñas o llaves escritas en el código** *(CWE-798 / OWASP A05)* | [`server/src/config.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/config.js#L6-L12) | Inspección de `config.js` revelando secretos por defecto en texto claro (`appSecret: 'dss-secreto-super-seguro-2026'`, `pass: 'Notif2026!'`). | Almacenar secretos exclusivamente en variables de entorno seguras fuera del control de versiones (`.env` ignorado) y fallar si no están definidas. |
| **SEC-13** | Confidencialidad / Integridad | Media | Alto | 🟠 **Alta** | **Cualquier página de fuera puede llamar a la API** *(CWE-942 / OWASP A05)* | [`server/src/app.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/app.js#L11-L16) | Configuración de CORS con reflejo ciego `origin: (origin, cb) => cb(null, true)` y `credentials: true`, permitiendo llamadas cross-origin arbitrarias. | Restringir CORS únicamente a la lista blanca de dominios oficiales de confianza (por ejemplo, el origen de la SPA cliente en desarrollo/producción). |
| **SEC-17** | Confidencialidad | Media | Alto | 🟠 **Alta** | **Viaja sin cifrar; el token queda en el navegador** *(CWE-319 / CWE-522)* | [`server/src/config.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/config.js#L17) y [`client/src/App.jsx`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/client/src/App.jsx#L201) | La aplicación corre sobre HTTP plano (`useHttps: false`) y el token de sesión se guarda en `localStorage`, expuesto a espionaje y robo por XSS. | Forzar el uso estricto de HTTPS (TLS) y almacenar los identificadores de sesión en cookies seguras con atributos `HttpOnly`, `Secure` y `SameSite`. |
| **SEC-08** | Integridad / Disponibilidad | Alta | Bajo | 🟡 **Media** | **El servidor acepta datos sin revisarlos** *(CWE-20 / OWASP A04)* | [`server/src/routes/users.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/users.routes.js), [`tasks.routes.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/routes/tasks.routes.js) | Envío de cuerpos JSON con campos vacíos, correos sin formato válido o datos inexistentes; la API procesa los datos sin validación de tipos ni esquemas. | Implementar validación y sanitización estricta de esquemas de entrada (usando librerías como Zod, Joi o express-validator). |
| **SEC-12** | Confidencialidad | Alta | Bajo | 🟡 **Media** | **Al fallar, muestra el detalle interno del error** *(CWE-209 / OWASP A05)* | [`server/src/app.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/app.js#L34-L41) | Provocación de un error interno; el manejador global devuelve `err.stack`, rutas de carpetas del servidor y variables de la petición en el JSON. | En entornos de producción, registrar los detalles técnicos exclusivamente en logs del servidor y responder al cliente con mensajes de error genéricos. |
| **SEC-16** | Integridad / Confidencialidad | Media | Medio | 🟡 **Media** | **Usa librerías viejas con fallas conocidas** *(CWE-1104 / OWASP A06)* | [`server/package.json`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/package.json#L17-L20) | Uso de versiones vulnerables fijadas en dependencias: `lodash: 4.17.20` (Prototype Pollution), `jsonwebtoken: 8.5.1` y `multer: 1.4.4`. | Ejecutar auditorías periódicas con `npm audit`, actualizar librerías a versiones mantenidas y aplicar herramientas SCA en el pipeline de CI/CD. |
| **SEC-15** | Integridad / Trazabilidad | Alta | Bajo | 🟢 **Baja** | **No queda registro de quién hizo qué** *(CWE-778 / OWASP A09)* | [`server/src/app.js`](file:///c:/Users/joeld/Downloads/CodigoSeguro/dss-proyecto-base/server/src/app.js) y controladores de rutas | La aplicación carece de registro de eventos de seguridad (auditoría de accesos fallidos, cambios de roles, creación/eliminación de datos sensibles). | Implementar logging estructurado centralizado (con herramientas como Winston o Pino) que registre timestamp, usuario, acción realizada e IP de origen. |

---

## 🏛️ Dónde vive cada principio en su aplicación (Tramo 3 · Laboratorio)

Mapeo de los principios de diseño seguro quebrantados en la aplicación frente a las categorías oficiales de **OWASP Top 10 (Edición 2025)** y su correspondiente **CWE**:

| Principio | Dónde se rompe en su App | Categoría · OWASP Top 10:2025 | CWE |
| :--- | :--- | :---: | :---: |
| **Mínimo privilegio** | **SEC-04**: Un alumno administra usuarios | **A01: Broken Access Control** | CWE-285 |
| **Defensa en profundidad** | **SEC-07**: La búsqueda ejecuta lo que le escriben | **A05: Injection** | CWE-89 |
| **Secure by Default** | El secreto del token viene escrito y en el `.env` (**SEC-14**) | **A02: Security Misconfiguration** *(o A04: Cryptographic Failures)* | CWE-798 |
| **Fallar cerrado** | El error 500 devuelve el interior del servidor (**SEC-12**) | **A10: Mishandling of Exceptional Conditions** | CWE-209 |
| **Superficie de ataque** | **SEC-16**: Dependencias con CVE conocidos —una ni se usa— y siguen instaladas | **A03: Software Supply Chain Failures** | CWE-1104 / CWE-1395 |

---

## 📝 Entrega de Reporte (Línea por Línea)

### Tramo 2 · Tres líneas (Lo que encontró el flujo y lo que no vio)
```text
dependencias      | SEC-16 | lodash high | permite contaminación de prototipo (Prototype Pollution) y denegación de servicio por expresiones regulares (ReDoS)
analisis-estatico | SEC-11 | server/src/routes/files.routes.js:43 security/detect-non-literal-fs-filename | permite leer archivos arbitrarios del servidor fuera de uploads/ mediante secuencias ../ (Path Traversal)
no lo vio         | SEC-06 | Un alumno borra con DELETE /api/tasks/3 una tarea ajena | no la ve porque el análisis estático no conoce las reglas de negocio ni sabe qué usuario es dueño del recurso | rompe Mínimo privilegio
```

### Tramo 3 · Tres líneas (Clasificación con OWASP Top 10:2025)
```text
SEC-02 | El token se puede leer y fabricar a mano | A07 Authentication Failures | la sesión se maneja con un Base64 plano sin firma digital HMAC ni secreto que valide autenticidad
SEC-05 | Un alumno se hace administrador solo | A01 Broken Access Control | la actualización permite modificar atributos privilegiados (role) por asignación masiva sin validar autorización
SEC-01 | Las contraseñas se guardan sin proteger | A04 Cryptographic Failures | las credenciales se almacenan y comparan en texto plano sin aplicar funciones de derivación con sal (hashing)
```

---

## 🏷️ Estado del Proyecto para la Exposición (6 Cerrados vs Deuda Declarada)

> 📄 *Para el desglose completo con comparativas frente a la `v0`, consultar [`EXPOSICION-DEUDA.md`](EXPOSICION-DEUDA.md).*

### 🟢 Los 6 Hallazgos Cerrados en la Unidad II:
- **SEC-12:** Manejo seguro de errores 500 y fuga de información (con [`regresion-sec12.test.js`](server/tests/regresion-sec12.test.js)).
- **SEC-06:** Control de acceso por pertenencia/ownership en tareas (con [`sec06.test.js`](server/tests/sec06.test.js)).
- **SEC-04:** Control de acceso por roles RBAC en usuarios (con [`sec04.test.js`](server/tests/sec04.test.js)).
- **SEC-07:** Búsqueda parametrizada contra Inyección SQL (con [`sec07.test.js`](server/tests/sec07.test.js)).
- **SEC-11:** Prevención de Path Traversal en descarga de archivos (con [`regresion-sec11.test.js`](server/tests/regresion-sec11.test.js)).
- **SEC-14:** Secretos fuera del código y `.env` excluido de Git (con [`regresion-sec14.test.js`](server/tests/regresion-sec14.test.js)).

### 🟡 Deuda Técnica Declarada (Abiertos a propósito para la Unidad III):
- **SEC-09 (XSS en comentarios):** Demostrado con `<img src=x onerror=alert(1)>`. Pendiente sanitizar con DOMPurify o quitar `dangerouslySetInnerHTML`.
- **SEC-10 (Subida sin revisar):** Demostrado con archivos sin validar. Pendiente validación de *magic bytes* y cuota de tamaño (5 MB).
- **El secreto en el historial:** La contraseña vieja de correo sigue visible en commits viejos (`83aa671`). Mitigación: rotación obligatoria de credenciales.
- **SEC-01, SEC-02, SEC-03, SEC-05, SEC-08, SEC-13, SEC-15, SEC-16, SEC-17:** Pendientes en backlog para la siguiente fase.




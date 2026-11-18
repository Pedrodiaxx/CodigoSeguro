# Diagrama de Flujo de Datos (DFD) con Controles de Seguridad · DSS

Diagrama de Flujo de Datos que modela las tres fronteras de interacción del sistema, sus flujos y los **controles de seguridad implementados** para mitigar las amenazas identificadas.

---

## 1. Diagrama DFD con Fronteras y Controles

```mermaid
flowchart LR
  %% Entidades y Procesos
  U["Usuario y su navegador<br/><i>(Cliente SPA)</i>"]
  
  subgraph PERIMETRO_API ["Perímetro del Servidor (Node.js / Express)"]
    API(("API Express<br/><i>(Controlador Central)</i>"))
    
    subgraph CONTROLES_F1 ["Controles de Entrada y Respuesta (Frontera F1)"]
      C1["[C1] requireAuth<br/><i>Verificación de sesión</i>"]
      C2["[C2] requireRole('ADMIN')<br/><i>RBAC usuarios (SEC-04)</i>"]
      C3["[C3] requireOwnership()<br/><i>Control de pertenencia (SEC-06)</i>"]
      C4["[C4] Manejador 500 neutro<br/><i>Sin stack ni fuga (SEC-12)</i>"]
      C5["[C5] disable('x-powered-by')<br/><i>Ocultamiento de tecnología</i>"]
    end
  end

  subgraph PERIMETRO_BD ["Perímetro Base de Datos"]
    DB[("SQLite<br/><i>(dss.db)</i>")]
    C6["[C6] Prepared Statements (?)<br/><i>Consultas parametrizadas (SEC-07)</i>"]
  end

  subgraph PERIMETRO_FS ["Perímetro Sistema de Archivos"]
    UP[("uploads/<br/><i>(Archivos locales)</i>")]
    C7["[C7] path.resolve() + startsWith()<br/><i>Contención canónica (SEC-11)</i>"]
  end

  %% Flujos Frontera F1: Navegador <-> API Express
  U -- "F1 · Credenciales y Token" --> C1 --> API
  U -- "F1 · Gestión de usuarios (requiere ADMIN)" --> C2 --> API
  U -- "F1 · Modificar/Borrar tarea (requiere Dueño)" --> C3 --> API
  API -- "F1 · Respuestas de error sanitizadas (500 neutro)" --> C4 --> U
  API -- "F1 · Respuestas HTTP sin banner Express" --> C5 --> U
  API -- "F1 · JSON de tareas y comentarios" --> U

  %% Flujos Frontera F2: API Express <-> SQLite
  API -- "F2 · INSERT / UPDATE parametrizados" --> C6 --> DB
  API -- "F2 · SELECT con marcadores ?" --> C6 --> DB
  DB -- "F2 · Filas de resultados" --> API

  %% Flujos Frontera F3: API Express <-> uploads/
  U -- "F3 · Subir / Solicitar archivo físico" --> API
  API -- "F3 · Validación de ruta canónica relativa" --> C7 --> UP
  UP -- "F3 · Flujo seguro del archivo en disco" --> API
  API -- "F3 · Descarga validada al usuario" --> U
```

---

## 2. Matriz de Controles de Seguridad por Frontera

| Frontera | Código Control | Control de Seguridad Implementado | Hallazgo Mitigado | Archivo de Implementación | Comportamiento Seguro |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **F1** *(Cliente $\leftrightarrow$ API)* | **C1** | Autenticación obligatoria con `requireAuth` | N/A | `server/src/middleware/auth.js` | Rechaza peticiones sin cabecera `Authorization` con `401 Unauthorized`. |
| **F1** *(Cliente $\leftrightarrow$ API)* | **C2** | Control de acceso basado en roles con `requireRole('ADMIN')` | **SEC-04** *(CWE-285)* | `server/src/routes/users.routes.js:13` | Alumnos no pueden listar ni crear usuarios; responde `403 Forbidden`. |
| **F1** *(Cliente $\leftrightarrow$ API)* | **C3** | Control de pertenencia a objetos con `requireOwnership(cargarTarea)` | **SEC-06** *(CWE-639)* | `server/src/routes/tasks.routes.js:54,71` | Impide que un usuario modifique o elimine recursos de otros; responde `403 Forbidden`. |
| **F1** *(Cliente $\leftrightarrow$ API)* | **C4** | Manejo global de errores 500 sanitizado | **SEC-12** *(CWE-209)* | `server/src/app.js:36-39` | Envía `err.stack` únicamente a la consola del servidor y responde al cliente `{"error": "Error interno"}`. |
| **F1** *(Cliente $\leftrightarrow$ API)* | **C5** | Supresión de cabecera de fingerprinting | **SEC-12** *(CWE-200)* | `server/src/app.js:10` | Ejecuta `app.disable('x-powered-by')` para no revelar la tecnología del servidor. |
| **F2** *(API $\leftrightarrow$ SQLite)* | **C6** | Consultas SQL parametrizadas con marcadores de posición `?` | **SEC-07** *(CWE-89)* | `server/src/routes/tasks.routes.js:28-31` | `db.prepare(...).all(patron, patron)` separa la sintaxis SQL de los datos del usuario, neutralizando inyecciones. |
| **F3** *(API $\leftrightarrow$ uploads/)* | **C7** | Normalización canónica de ruta con `path.resolve` y verificación `startsWith` | **SEC-11** *(CWE-22)* | `server/src/routes/files.routes.js:40-45` | Resuelve la ruta canónica y verifica `target.startsWith(uploadRoot + sep)`; secuencias `../` son rechazadas con `404 Not Found`. |
| **Transversal** *(Entorno / Config)* | **C8** | Desacoplamiento de credenciales a `process.env` y exclusión de `.env` | **SEC-14** *(CWE-798)* | `server/src/config.js:7-13`, `.gitignore:8` | Elimina contraseñas en código duro y evita su persistencia en el repositorio Git. |

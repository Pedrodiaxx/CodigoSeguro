# Diagrama de Flujo de Datos (DFD) · DSS

\`\`\`mermaid
flowchart LR
  U[Usuario y su navegador]
  API((API Express))
  DB[(SQLite)]
  UP[(uploads/)]

  %% F1: Frontera Navegador <-> API
  U -- "F1 · usuario y contraseña" --> API
  API -- "F1 · token de sesión" --> U
  U -- "F1 · crear/editar tarea (JSON)" --> API
  U -- "F1 · parámetro de búsqueda q" --> API
  API -- "F1 · lista de tareas (JSON)" --> U
  U -- "F1 · subir archivo" --> API
  API -- "F1 · descargar archivo" --> U

  %% F2: Frontera API <-> SQLite
  API -- "F2 · INSERT / UPDATE tareas" --> DB
  API -- "F2 · SELECT con parámetros ?" --> DB
  DB -- "F2 · filas de tareas y usuarios" --> API

  %% F3: Frontera API <-> uploads/
  API -- "F3 · guardar archivo físico" --> UP
  UP -- "F3 · leer flujo del archivo" --> API
\`\`\`

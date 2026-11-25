import pino from 'pino';

export const log = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime, // la hora legible: "2026-11-23T22:05:12.345Z" (en UTC)
    // redacción: si alguno de estos campos llega al log, se escribe [Redacted] en su lugar
    redact: ['password', '*.password', 'token', '*.token', 'req.headers.authorization', 'req.headers.cookie'],
  },
  // un archivo, no la consola: logs/auditoria.log (el .gitignore ya excluye *.log)
  pino.destination({ dest: 'logs/auditoria.log', mkdir: true, sync: true }),
);

// middleware: al TERMINAR cada petición, deja una línea con quién, qué, cuándo, desde dónde y el resultado
export function auditoria(req, res, next) {
  res.on('finish', () => {
    if (req.method === 'GET' && res.statusCode < 400) return; // las lecturas normales no; los rechazos sí
    log.info(
      {
        usuario: req.user?.id ?? null, // quién (null = sin sesión)
        metodo: req.method,            // qué
        ruta: req.originalUrl,
        ip: req.ip,                    // desde dónde
        estado: res.statusCode,        // con qué resultado
      },
      'accion',
    );
  });
  next();
}

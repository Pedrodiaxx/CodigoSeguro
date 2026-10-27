// Configuración de la aplicación.

export const config = {
  port: Number(process.env.PORT) || 4000,

  // El secreto ahora viene de la variable de entorno, sin valor por defecto hardcodeado
  appSecret: process.env.APP_SECRET,

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.tecdesoftware.example',
    user: process.env.SMTP_USER || 'notificaciones@tecdesoftware.example',
    pass: process.env.SMTP_PASS, // sin contraseña en el código
  },

  dbFile: process.env.DB_FILE || 'data/dss.db',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',

  useHttps: false,
};

import { Router } from 'express';
import { findUserByCredentials, issueToken } from '../auth.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { log } from '../log.js';

export const authRouter = Router();

// POST /api/auth/login  — inicia sesión y devuelve el token en una cookie segura (SEC-17)
authRouter.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  const user = findUserByCredentials(username, password);
  if (!user) {
    log.warn({ evento: 'login_fallido', usuario: username, ip: req.ip }, 'login fallido');
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  log.info({ evento: 'login', usuario: user.id, ip: req.ip }, 'login correcto');

  res.cookie('token', issueToken(user), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,
  });
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    },
  });
});

// GET /api/auth/me  — datos del usuario de la sesión actual
authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/logout — cierra la sesión EN EL SERVIDOR: todo token anterior deja de servir
authRouter.post('/logout', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?').run(req.user.id);
  log.info({ evento: 'logout', usuario: req.user.id, ip: req.ip }, 'sesión cerrada');
  res.clearCookie('token');
  res.status(204).end();
});

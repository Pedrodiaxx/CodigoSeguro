// Emisión y verificación del "token" de sesión con HMAC (SEC-02).

import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';
import { db } from './db/index.js';
import { verifyPassword } from './password.js';

const firmar = (datos) => createHmac('sha256', config.appSecret).update(datos).digest('base64url');

// El token es id.versión.firma : la firma solo la puede calcular quien conoce el secreto del servidor.
export function issueToken(user) {
  const version = user.token_version ?? 0;
  const datos = `${user.id}.${version}`;
  return `${datos}.${firmar(datos)}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const [id, version, firma] = token.split('.');
  if (!firma) return null;
  const esperada = Buffer.from(firmar(`${id}.${version}`));
  const recibida = Buffer.from(firma);

  // timingSafeEqual compara SIEMPRE completo: con ===, la respuesta tardaría más mientras más caracteres acierte el atacante
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null; // firma falsa

  const user = db
    .prepare('SELECT id, username, email, full_name, phone, role, token_version FROM users WHERE id = ?')
    .get(Number(id));
  if (!user || user.token_version !== Number(version)) return null; // la sesión ya se cerró
  return user;
}

export function findUserByCredentials(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return null;
  if (!verifyPassword(password, user.password)) return null;
  return user;
}

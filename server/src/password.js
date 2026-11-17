// server/src/password.js · archivo nuevo · Argon2id viene en Node (24.7 o más), sin instalar nada
import { argon2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const M = 19456, T = 2, P = 1; // 19 MiB de memoria · 2 pasadas · 1 hilo: el mínimo de OWASP
const b64 = (buf) => buf.toString('base64').replace(/=+$/, '');

export function hashPassword(password) {
  const salt = randomBytes(16); // salt nuevo y aleatorio, por contraseña
  const hash = argon2Sync('argon2id', {
    message: password,
    nonce: salt,
    memory: M,
    passes: T,
    parallelism: P,
    tagLength: 32,
  });
  return `$argon2id$v=19$m=${M},t=${T},p=${P}$${b64(salt)}$${b64(hash)}`; // todo en un texto
}

export function verifyPassword(password, guardado) {
  if (typeof password !== 'string' || typeof guardado !== 'string') return false; // sin esto: 500
  const [, alg, , params, salt, hash] = guardado.split('$');
  if (alg !== 'argon2id') return false; // una contraseña en claro no entra
  const [m, t, p] = params.split(',').map((x) => Number(x.split('=')[1]));
  const esperado = Buffer.from(hash, 'base64');
  const calculado = argon2Sync('argon2id', {
    message: password,
    nonce: Buffer.from(salt, 'base64'),
    memory: m,
    passes: t,
    parallelism: p,
    tagLength: esperado.length,
  });
  return timingSafeEqual(calculado, esperado); // compara en tiempo constante
}

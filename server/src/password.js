// server/src/password.js · Argon2id nativo (si está disponible) o fallback con paquete argon2
import * as crypto from 'node:crypto';
import { Worker, MessageChannel, receiveMessageOnPort } from 'node:worker_threads';

const M = 19456, T = 2, P = 1; // 19 MiB de memoria · 2 pasadas · 1 hilo: el mínimo de OWASP
const b64 = (buf) => buf.toString('base64').replace(/=+$/, '');

const hasNativeArgon2 = typeof crypto.argon2Sync === 'function';

// Fallback síncrono mediante worker thread cuando crypto.argon2Sync no está expuesto en node:crypto
let fallbackWorker = null;
function getFallbackWorker() {
  if (!fallbackWorker) {
    const workerCode = `
      const { parentPort } = require('node:worker_threads');
      const argon2 = require('argon2');
      parentPort.on('message', async ({ action, args, port, sab }) => {
        const int32 = new Int32Array(sab);
        try {
          let res;
          if (action === 'hash') {
            res = await argon2.hash(args.password, {
              type: argon2.argon2id,
              memoryCost: args.m,
              timeCost: args.t,
              parallelism: args.p,
            });
          } else {
            res = await argon2.verify(args.guardado, args.password);
          }
          port.postMessage({ ok: true, res });
        } catch (e) {
          port.postMessage({ ok: false, err: e.message });
        } finally {
          Atomics.store(int32, 0, 1);
          Atomics.notify(int32, 0);
        }
      });
    `;
    fallbackWorker = new Worker(workerCode, { eval: true });
    fallbackWorker.unref();
  }
  return fallbackWorker;
}

function runFallbackSync(action, args) {
  const worker = getFallbackWorker();
  const { port1, port2 } = new MessageChannel();
  const sab = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sab);
  worker.postMessage({ action, args, port: port2, sab }, [port2]);
  Atomics.wait(int32, 0, 0);
  const msg = receiveMessageOnPort(port1);
  if (!msg?.message?.ok) {
    throw new Error(msg?.message?.err || 'Error en argon2 worker');
  }
  return msg.message.res;
}

export function hashPassword(password) {
  if (hasNativeArgon2) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.argon2Sync('argon2id', {
      message: password,
      nonce: salt,
      memory: M,
      passes: T,
      parallelism: P,
      tagLength: 32,
    });
    return `$argon2id$v=19$m=${M},t=${T},p=${P}$${b64(salt)}$${b64(hash)}`;
  }

  return runFallbackSync('hash', { password, m: M, t: T, p: P });
}

export function verifyPassword(password, guardado) {
  if (typeof password !== 'string' || typeof guardado !== 'string') return false;
  if (!guardado.startsWith('$argon2id$')) return false;

  if (hasNativeArgon2) {
    const [, alg, , params, salt, hash] = guardado.split('$');
    if (alg !== 'argon2id') return false;
    const [m, t, p] = params.split(',').map((x) => Number(x.split('=')[1]));
    const esperado = Buffer.from(hash, 'base64');
    const calculado = crypto.argon2Sync('argon2id', {
      message: password,
      nonce: Buffer.from(salt, 'base64'),
      memory: m,
      passes: t,
      parallelism: p,
      tagLength: esperado.length,
    });
    return crypto.timingSafeEqual(calculado, esperado);
  }

  try {
    return runFallbackSync('verify', { password, guardado });
  } catch {
    return false;
  }
}

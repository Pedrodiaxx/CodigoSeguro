// costo.mjs · en server/, con node costo.mjs
import * as crypto from 'node:crypto';
import argon2 from 'argon2';

const opciones = [
  { memory: 19456, passes: 2 }, // 19 MiB · 2 pasadas (el mínimo de OWASP)
  { memory: 47104, passes: 1 }, // 46 MiB · 1 pasada (otra opción de OWASP)
  { memory: 65536, passes: 3 }, // 64 MiB · 3 pasadas (más fuerte)
];

const hasNativeArgon2 = typeof crypto.argon2Sync === 'function';

for (const { memory, passes } of opciones) {
  const t = performance.now();
  if (hasNativeArgon2) {
    crypto.argon2Sync('argon2id', {
      message: 'Admin123',
      nonce: crypto.randomBytes(16),
      memory,
      passes,
      parallelism: 1,
      tagLength: 32,
    });
  } else {
    await argon2.hash('Admin123', {
      type: argon2.argon2id,
      memoryCost: memory,
      timeCost: passes,
      parallelism: 1,
    });
  }
  console.log(`${Math.round(memory / 1024)} MiB · ${passes} pasadas:`, Math.round(performance.now() - t), 'ms');
}

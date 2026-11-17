// costo.mjs · en server/, con node costo.mjs
import { argon2Sync, randomBytes } from 'node:crypto';

const opciones = [
  { memory: 19456, passes: 2 }, // 19 MiB · 2 pasadas (el mínimo de OWASP)
  { memory: 47104, passes: 1 }, // 46 MiB · 1 pasada (otra opción de OWASP)
  { memory: 65536, passes: 3 }, // 64 MiB · 3 pasadas (más fuerte)
];

for (const { memory, passes } of opciones) {
  const t = performance.now();
  argon2Sync('argon2id', {
    message: 'Admin123',
    nonce: randomBytes(16),
    memory,
    passes,
    parallelism: 1,
    tagLength: 32,
  });
  console.log(`${Math.round(memory / 1024)} MiB · ${passes} pasadas:`, Math.round(performance.now() - t), 'ms');
}

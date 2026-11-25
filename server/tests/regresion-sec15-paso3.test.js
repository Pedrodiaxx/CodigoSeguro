// server/tests/regresion-sec15-paso3.test.js · Pruebas del Paso 3 para SEC-15 (Logging de Logout)
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { readFileSync, writeFileSync } from 'node:fs';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';
import { tokenDe } from './token.js';

const ARCHIVO = 'logs/auditoria.log';
const lineas = () => readFileSync(ARCHIVO, 'utf8').split('\n').filter(Boolean); // una línea = un evento

describe('SEC-15 · Paso 3 · el logout', () => {
  beforeEach(() => {
    resetForTests();
    writeFileSync(ARCHIVO, '');
  });

  it('Joel: el logout deja rastro: quién, desde dónde y cuándo', async () => {
    const res = await request(createApp())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tokenDe(4)}`); // el alumno cierra su sesión

    expect(res.status).toBe(204);
    const e = lineas()
      .map((l) => JSON.parse(l))
      .find((x) => x.evento === 'logout');
    expect(e.usuario).toBe(4);        // quién
    expect(e.ip).toBeDefined();       // desde dónde
    expect(e.time).toBeDefined();     // cuándo
  });
});

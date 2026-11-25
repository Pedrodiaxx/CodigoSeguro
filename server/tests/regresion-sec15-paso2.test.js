// server/tests/regresion-sec15-paso2.test.js · Pruebas del Paso 2 para SEC-15 (Logging)
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { readFileSync, writeFileSync } from 'node:fs';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

const ARCHIVO = 'logs/auditoria.log';
const lineas = () => readFileSync(ARCHIVO, 'utf8').split('\n').filter(Boolean); // una línea = un evento

describe('SEC-15 · Paso 2 · el login', () => {
  beforeEach(() => {
    resetForTests();
    writeFileSync(ARCHIVO, '');
  });

  it('Esteban Priego: la contraseña nunca llega al log', async () => {
    await request(createApp()).post('/api/auth/login').send({ username: 'admin', password: 'Admin123' });
    await request(createApp()).post('/api/auth/login').send({ username: 'admin', password: 'ClaveEquivocada9' });

    const texto = readFileSync(ARCHIVO, 'utf8');
    expect(texto).toContain('login_fallido'); // el intento fallido sí quedó
    expect(texto).not.toContain('Admin123'); // la contraseña correcta, no
    expect(texto).not.toContain('ClaveEquivocada9'); // y la equivocada tampoco
  });

  it('Esteban Priego: un usuario con salto de línea no fabrica una entrada falsa', async () => {
    const falso = 'nadie\n{"level":30,"evento":"login","usuario":1,"msg":"login correcto"}';
    await request(createApp()).post('/api/auth/login').send({ username: falso, password: 'x' });

    const eventos = lineas().map((l) => JSON.parse(l));
    expect(eventos.filter((e) => e.evento === 'login')).toHaveLength(0); // ¿cuántos «login correcto» debe haber? 0
    expect(eventos.find((e) => e.evento === 'login_fallido').usuario).toBe(falso); // el salto quedó DENTRO del texto
  });
});

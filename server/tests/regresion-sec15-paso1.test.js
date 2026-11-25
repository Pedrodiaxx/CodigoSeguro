// server/tests/regresion-sec15-paso1.test.js · Pruebas del Paso 1 para SEC-15 (Logging)
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { readFileSync, writeFileSync } from 'node:fs';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';
import { log } from '../src/log.js';
import { tokenDe } from './token.js';

const ARCHIVO = 'logs/auditoria.log';
const lineas = () => readFileSync(ARCHIVO, 'utf8').split('\n').filter(Boolean); // una línea = un evento

describe('SEC-15 · Paso 1 · el registro', () => {
  beforeEach(() => {
    resetForTests();
    writeFileSync(ARCHIVO, '');
  }); // cada prueba empieza con el log vacío

  it('Joel: el ataque deja rastro: quién, qué, desde dónde y con qué resultado', async () => {
    await request(createApp())
      .patch('/api/users/4')
      .set('Authorization', `Bearer ${tokenDe(4)}`)
      .send({ role: 'ADMIN' }); // el alumno intenta ascenderse

    const e = JSON.parse(lineas().at(-1));
    expect(e.usuario).toBe(4);          // quién
    expect(e.metodo).toBe('PATCH');     // qué
    expect(e.ruta).toBe('/api/users/4');
    expect(e.ip).toBeDefined();         // desde dónde
    expect(e.estado).toBe(403);         // con qué resultado
    expect(e.time).toBeDefined();       // cuándo
  });

  it('Joel: si alguien registra el cuerpo de la petición, la contraseña sale [Redacted]', () => {
    log.info({ body: { username: 'admin', password: 'Admin123' } }, 'descuido');
    const texto = readFileSync(ARCHIVO, 'utf8');
    expect(texto).toContain('[Redacted]');
    expect(texto).not.toContain('Admin123');
  });
});

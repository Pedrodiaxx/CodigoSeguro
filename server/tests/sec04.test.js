import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  resetForTests();
});

describe('SEC-04: Control de acceso por roles (RBAC)', () => {
  it('Joel: un alumno ya NO puede listar a todos los usuarios', async () => {
    // 1. Token de un alumno común (id: 4)
    const alumnoToken = Buffer.from('4:alumno').toString('base64');

    // 2. El alumno intenta pedir la lista de usuarios
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${alumnoToken}`);

    // 3. Antes daba 200 (con la lista), ahora debe dar 403 (prohibido)
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No autorizado');
  });
});

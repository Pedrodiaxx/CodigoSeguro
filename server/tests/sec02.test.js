import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  // Reiniciamos la base de datos antes de cada prueba para tener estado limpio
  resetForTests();
});

describe('SEC-02: Token forjado', () => {
  it('un token fabricado con base64("1:admin") entra como administrador', async () => {
    // 1. Fabricamos el token a mano sin saber la contraseña
    const forgedToken = Buffer.from('1:admin').toString('base64');

    // 2. Hacemos la petición a /api/auth/me presentándonos con ese token
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${forgedToken}`);

    // 3. Afirmaciones (Asserts): el servidor nos acepta y nos reconoce como ADMIN
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('admin');
    expect(res.body.role).toBe('ADMIN');
  });
});

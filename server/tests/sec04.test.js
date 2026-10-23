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

describe('SEC-04: Exposición de usuarios y contraseñas a alumnos', () => {
  it('un alumno pide GET /api/users y recibe 200, con las contraseñas dentro', async () => {
    // 1. Token de un alumno legítimo (id: 4, username: alumno)
    const alumnoToken = Buffer.from('4:alumno').toString('base64');

    // 2. El alumno solicita la lista de usuarios
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${alumnoToken}`);

    // 3. Verificamos la vulnerabilidad: responde 200 y es un arreglo
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // 4. Verificamos que expone al usuario admin y su contraseña en texto claro
    const adminUser = res.body.find((u) => u.username === 'admin');
    expect(adminUser).toBeDefined();
    expect(adminUser.password).toBe('Admin123');
  });
});

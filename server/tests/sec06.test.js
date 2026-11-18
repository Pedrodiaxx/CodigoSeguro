import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';
import { tokenDe } from './token.js';

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  resetForTests();
});

describe('SEC-06: Control de acceso a objetos (Ownership)', () => {
  it('Joel: un alumno YA NO borra una tarea ajena', async () => {
    // 1. Token de un alumno (id: 4) con token firmado válido
    const alumnoToken = `Bearer ${tokenDe(4)}`;

    // 2. El alumno intenta borrar la tarea 3 (creada por el profesor)
    const res = await request(app)
      .delete('/api/tasks/3')
      .set('Authorization', alumnoToken);

    // 3. Antes daba 204 (borrado), ahora debe ser 403 (prohibido)
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No autorizado');
  });
});

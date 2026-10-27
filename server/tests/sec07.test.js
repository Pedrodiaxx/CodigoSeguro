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

describe('SEC-07: Inyección SQL en búsqueda de tareas', () => {
  it('Joel: la búsqueda ya no concatena y busca el texto literal', async () => {
    // 1. Token del alumno
    const alumnoToken = 'Bearer NDphbHVtbm8=';

    // 2. Enviamos el ataque de inyección SQL
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ q: "%' OR 1=1 --" })
      .set('Authorization', alumnoToken);

    // 3. Antes devolvía 3 filas (inyección exitosa); ahora debe responder 200 con CERO filas
    expect(res.status).toBe(200);
    expect(res.body.rows).toHaveLength(0);
  });
});

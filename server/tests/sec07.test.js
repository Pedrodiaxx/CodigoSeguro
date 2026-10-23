import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  // Trampa 1: reseteamos la base de datos para asegurar el estado limpio
  resetForTests();
});

describe('SEC-07: Inyección SQL en búsqueda de tareas', () => {
  it('la búsqueda con la cadena de inyección devuelve más filas de las que debería', async () => {
    // 1. Token de un alumno (id: 4)
    const alumnoToken = Buffer.from('4:alumno').toString('base64');

    // 2. Trampa 2 resuelta: usamos .query({ q: ... }) de Supertest para no corromper la URL
    const res = await request(app)
      .get('/api/tasks/search')
      .query({ q: "' OR '1'='1" })
      .set('Authorization', `Bearer ${alumnoToken}`);

    // 3. Verificamos que la inyección fue exitosa:
    // Devuelve status 200 y la lista completa de tareas (3 tareas en vez de 0)
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rows)).toBe(true);
    expect(res.body.rows.length).toBe(3);

    // Comprobamos que expone la tarea confidencial del profesor
    const tareaConfidencial = res.body.rows.find((t) => t.id === 3);
    expect(tareaConfidencial).toBeDefined();
    expect(tareaConfidencial.title).toContain('confidencial');
  });
});

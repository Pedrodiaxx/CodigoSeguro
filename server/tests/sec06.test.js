import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  // Reiniciamos la base de datos antes de cada prueba para que la eliminación de la tarea no afecte otras pruebas
  resetForTests();
});

describe('SEC-06: Control de acceso a objetos (IDOR / BOLA)', () => {
  it('un alumno borra con DELETE /api/tasks/3 una tarea que no es suya', async () => {
    // 1. Token de un alumno (id: 4)
    const alumnoToken = Buffer.from('4:alumno').toString('base64');

    // 2. El alumno intenta borrar la tarea 3 (creada por la profesora Paola, id: 3)
    const delRes = await request(app)
      .delete('/api/tasks/3')
      .set('Authorization', `Bearer ${alumnoToken}`);

    // 3. Verificamos que el servidor permitió el borrado con 204 No Content
    expect(delRes.status).toBe(204);

    // 4. Comprobamos que la tarea efectivamente ya no existe (404 Not Found)
    const getRes = await request(app)
      .get('/api/tasks/3')
      .set('Authorization', `Bearer ${alumnoToken}`);

    expect(getRes.status).toBe(404);
  });
});

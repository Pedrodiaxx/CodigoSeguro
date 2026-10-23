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

describe('Regresión SEC-12: Manejo seguro de errores 500 y fuga de información', () => {
    it('el 500 ya no trae el stack', async () => {
        const res = await request(app)
            .get('/api/tasks/search')
            .query({ q: "x' AND (SELECT 1 FROM nope)--" })
            .set('Authorization', 'Bearer MTphZG1pbg==');

        expect(res.status).toBe(500);
        expect(res.body.stack).toBeUndefined();
        expect(res.body.query).toBeUndefined();
        expect(res.body.error).toBe('Error interno');
    });

    it('Joel: la búsqueda ya no manda su consulta', async () => {
        const res = await request(app)
            .get('/api/tasks/search')
            .query({ q: 'Práctica' })
            .set('Authorization', 'Bearer MTphZG1pbg==');

        expect(res.status).toBe(200);
        expect(res.body.sql).toBeUndefined();
    });
});

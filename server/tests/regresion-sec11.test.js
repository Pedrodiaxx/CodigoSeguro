import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';

describe('SEC-11: Path Traversal en descarga de archivos', () => {
    beforeEach(() => resetForTests());

    it('Joel: ya no se lee un archivo de fuera de uploads', async () => {
        const res = await request(createApp())
            .get('/api/files/raw')
            .query({ name: '../src/config.js' })
            .set('Authorization', 'Bearer NDphbHVtbm8=');

        // Antes respondía 200 (filtrando el archivo); ahora debe dar 404 (no encontrado)
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Archivo no encontrado');
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetForTests } from '../src/db/index.js';
import { tokenDe } from './token.js';

describe('SEC-02 y SEC-17 · la sesión', () => {
  beforeEach(() => resetForTests());

  it('Pedro Díaz: un token cambiado a mano no entra', async () => {
    const [, version, firma] = tokenDe(4).split('.'); // el token del alumno...
    const falso = `1.${version}.${firma}`; // ...con el id del admin
    const res = await request(createApp()).get('/api/users').set('Authorization', `Bearer ${falso}`);
    expect(res.status).toBe(401);
  });

  it('Esteban Priego: después de Salir, el token viejo ya no sirve', async () => {
    const viejo = tokenDe(1);
    await request(createApp()).post('/api/auth/logout').set('Authorization', `Bearer ${viejo}`);
    const res = await request(createApp()).get('/api/users').set('Authorization', `Bearer ${viejo}`);
    expect(res.status).toBe(401);
  });

  it('Pedro Díaz: la sesión viaja en una cookie HttpOnly, Secure y SameSite=Strict', async () => {
    const res = await request(createApp()).post('/api/auth/login').send({ username: 'admin', password: 'Admin123' });
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/HttpOnly/i); // un script no la puede leer
    expect(cookie).toMatch(/Secure/i); // solo viaja por https (o localhost)
    expect(cookie).toMatch(/SameSite=Strict/i); // otro sitio no la manda
    expect(res.body.token).toBeUndefined(); // y el token ya no va en el JSON
  });
});

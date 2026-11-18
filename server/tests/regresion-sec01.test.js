// server/tests/regresion-sec01.test.js · Pruebas de regresión para SEC-01 (Hash de contraseñas con Argon2id)
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db, resetForTests } from '../src/db/index.js';
import { tokenDe } from './token.js';

const tokenAdmin = () => tokenDe(1); // 1:admin · Token de administrador válido firmado con HMAC

describe('SEC-01 contraseñas con Argon2id', () => {
  beforeEach(() => resetForTests());

  it('Joel: la BD no guarda la contraseña en claro', () => {
    const row = db.prepare("SELECT password FROM users WHERE username='admin'").get();
    expect(row.password).not.toBe('Admin123');
    expect(row.password.startsWith('$argon2id$')).toBe(true);
  });

  it('Joel: el login con la correcta funciona, y con otra no', async () => {
    const bien = await request(createApp()).post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin123' });
    expect(bien.status).toBe(200);

    const mal = await request(createApp()).post('/api/auth/login')
      .send({ username: 'admin', password: 'otra' });
    expect(mal.status).toBe(401); // 401 (no autenticado)
  });

  it('Joel: la API nunca devuelve el campo password', async () => {
    const res = await request(createApp()).get('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin()}`);
    expect(res.status).toBe(200);
    expect(res.body[0].password).toBeUndefined();
  });

  it('Joel: un usuario creado por la API se guarda con hash', async () => {
    await request(createApp()).post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ username: 'nuevo', password: 'Nuevo123', email: 'n@x.mx', full_name: 'Nuevo' });

    const row = db.prepare("SELECT password FROM users WHERE username='nuevo'").get();
    expect(row).toBeDefined();
    expect(row.password.startsWith('$argon2id$')).toBe(true);
  });
});

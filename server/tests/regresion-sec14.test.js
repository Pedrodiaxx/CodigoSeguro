import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SEC-14: Secretos fuera del código fuente', () => {
    it('Joel: config.js ya no contiene secretos escritos a mano', () => {
        const configSource = readFileSync(resolve(__dirname, '../src/config.js'), 'utf-8');

        // Comprobamos que las contraseñas y llaves ya no están escritas en el código
        expect(configSource).not.toContain('dss-secreto-super-seguro-2026');
        expect(configSource).not.toContain('Notif2026!');
    });
});

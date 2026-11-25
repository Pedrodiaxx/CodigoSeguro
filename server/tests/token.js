import { db } from '../src/db/index.js';
import { issueToken } from '../src/auth.js';

export const tokenDe = (id) => issueToken(db.prepare('SELECT * FROM users WHERE id = ?').get(id));

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db/init.js';

export const authRouter = Router();

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

/** Middleware: require authenticated admin session */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// POST /api/admin/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT id, username, passwordHash FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; passwordHash: string }
    | undefined;

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ username: user.username });
});

// POST /api/admin/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/admin/me
authRouter.get('/me', (req: Request, res: Response) => {
  if (req.session?.userId) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

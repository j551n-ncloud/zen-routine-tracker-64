
import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { query, queryOne } from '../database/db';
import { User } from './types';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Get current user profile
  router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = queryOne<User>(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
      WHERE id = :userId
    `, { userId });
    
    return res.json(user);
  });
  
  // Admin only: Get all users
  router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    const users = query<User>(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
      ORDER BY username
    `);
    
    return res.json(users);
  });
  
  return router;
}


import { Router, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { getUserById, getUserByUsername } from '../database/users';
import { query } from '../database/db';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Get all users (admin only)
  router.get('/', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
    const users = query(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
      ORDER BY id
    `);
    
    return res.json(users);
  });
  
  // Get current user profile
  router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = getUserById(db, userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  });
  
  return router;
}

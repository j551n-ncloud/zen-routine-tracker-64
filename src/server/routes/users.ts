
import { Router, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { getUserById } from '../database/users';
import { User } from './types';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Get current user
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
  
  // Get all users (admin only)
  router.get('/', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
    // This should only be accessible to admin users
    
    const users = db.prepare('SELECT id, username, is_admin, created_at, updated_at FROM users').all() as User[];
    
    return res.json(users);
  });
  
  return router;
}

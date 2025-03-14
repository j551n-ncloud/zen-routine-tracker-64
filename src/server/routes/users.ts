
import { Router } from 'express';
import Database from 'better-sqlite3';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { getUserById, createUser } from '../database/users';
import { query, queryOne } from '../database/db';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Get current user profile
  router.get('/me', authenticate, async (req: AuthRequest, res) => {
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
  
  // Admin only: Get all users
  router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    const users = query(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
    `);
    
    return res.json(users);
  });
  
  return router;
}

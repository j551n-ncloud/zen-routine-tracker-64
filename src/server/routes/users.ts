
import { Router } from 'express';
import Database from 'better-sqlite3';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { query, queryOne } from '../database/db';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Middleware for all routes
  router.use(authenticate);
  
  // Get current user
  router.get('/me', (req: AuthRequest, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = queryOne(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users 
      WHERE id = :userId
    `, { userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  });
  
  // Admin only routes below
  router.use(requireAdmin);
  
  // Get all users (admin only)
  router.get('/', (req: AuthRequest, res) => {
    const users = query(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
      ORDER BY username
    `);
    
    return res.json(users);
  });
  
  return router;
}


import { Router } from 'express';
import Database from 'better-sqlite3';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { getUserById } from '../database/users';

export function createUsersRouter(db: Database.Database) {
  const router = Router();
  
  // Get current user
  router.get('/me', authenticate, (req: AuthRequest, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = getUserById(db, req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  });
  
  // Get all users (admin only)
  router.get('/', authenticate, requireAdmin, (req: AuthRequest, res) => {
    // This functionality requires the users table
    return res.json([]);
  });
  
  return router;
}

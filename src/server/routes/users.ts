
import { Router } from 'express';
import Database from 'better-sqlite3';
import { getUserById, createUser } from '../database/users';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { query } from '../database/db';

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
    
    const user = getUserById(db, userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  });
  
  // Admin route: Get all users
  router.get('/', requireAdmin, (_req, res) => {
    const users = query(db, `
      SELECT id, username, is_admin, created_at, updated_at
      FROM users
      ORDER BY username
    `);
    
    return res.json(users);
  });
  
  // Admin route: Create new user
  router.post('/', requireAdmin, (req, res) => {
    const { username, password, isAdmin } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    try {
      const user = createUser(db, username, password, isAdmin);
      
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      return res.status(201).json(user);
    } catch (error) {
      if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  return router;
}

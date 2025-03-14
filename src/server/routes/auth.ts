
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { validateCredentials, createUser } from '../database/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function createAuthRouter(db: Database.Database) {
  const router = Router();
  
  // Login route
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Validate credentials
    const user = validateCredentials(db, username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.is_admin 
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success response
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
      },
      token
    });
  });
  
  // Register route
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username is already taken
    try {
      // Create new user (non-admin by default)
      const user = createUser(db, username, password);
      
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.is_admin 
        }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return success response
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.is_admin
        },
        token
      });
    } catch (error) {
      if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  return router;
}

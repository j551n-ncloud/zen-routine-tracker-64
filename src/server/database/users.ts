
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { execute, queryOne } from './db';

export interface User {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Create default admin user if none exists
export function createDefaultUser(db: Database.Database): void {
  console.log('Checking if default admin user needs to be created...');
  
  // Check if any users exist
  const userCount = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM users');
  
  if (!userCount || userCount.count === 0) {
    console.log('No users found, creating default admin user...');
    
    // Hash the password
    const passwordHash = bcrypt.hashSync('admin', 10);
    
    // Insert the admin user
    execute(db, `
      INSERT INTO users (username, password, is_admin)
      VALUES (:username, :password, :is_admin)
    `, {
      username: 'admin',
      password: passwordHash,
      is_admin: 1
    });
    
    console.log('Default admin user created successfully (admin/admin)');
  } else {
    console.log('Users already exist, skipping default user creation');
  }
}

// Get user by username
export function getUserByUsername(db: Database.Database, username: string): (User & { password: string }) | null {
  return queryOne<User & { password: string }>(db, `
    SELECT id, username, password, is_admin, created_at, updated_at
    FROM users
    WHERE username = :username
  `, { username });
}

// Get user by ID
export function getUserById(db: Database.Database, id: number): User | null {
  return queryOne<User>(db, `
    SELECT id, username, is_admin, created_at, updated_at
    FROM users
    WHERE id = :id
  `, { id });
}

// Create a new user
export function createUser(db: Database.Database, username: string, password: string, isAdmin: boolean = false): User | null {
  // Hash the password
  const passwordHash = bcrypt.hashSync(password, 10);
  
  // Insert the user
  execute(db, `
    INSERT INTO users (username, password, is_admin)
    VALUES (:username, :password, :is_admin)
  `, {
    username,
    password: passwordHash,
    is_admin: isAdmin ? 1 : 0
  });
  
  // Return the created user
  return getUserByUsername(db, username);
}

// Check if a user's credentials are valid
export function validateCredentials(db: Database.Database, username: string, password: string): User | null {
  const user = getUserByUsername(db, username);
  
  if (!user) {
    return null;
  }
  
  // Check if the password matches
  const isValid = bcrypt.compareSync(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  // Return the user without the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

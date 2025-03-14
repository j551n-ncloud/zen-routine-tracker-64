
import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';
import { createTablesSQL } from './schema';

const DB_PATH = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'data/zentracker.db')
  : join(process.cwd(), 'data/zentracker-dev.db');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize the database connection
export function initializeDatabase(): Database.Database {
  console.log(`Initializing SQLite database at: ${DB_PATH}`);
  ensureDataDir();
  
  const db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist
  createTables(db);
  
  return db;
}

// Create all tables defined in the schema
function createTables(db: Database.Database): void {
  console.log('Creating database tables if they don\'t exist...');
  const statements = db.prepare(createTablesSQL);
  statements.run();
  console.log('Database tables are ready');
}

// Execute a query and return all results
export function query<T>(db: Database.Database, sql: string, params: any[] = []): T[] {
  try {
    const statement = db.prepare(sql);
    return statement.all(...params) as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute a query and return the first result
export function queryOne<T>(db: Database.Database, sql: string, params: any[] = []): T | null {
  try {
    const statement = db.prepare(sql);
    return statement.get(...params) as T || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute a query for insert/update/delete
export function execute(db: Database.Database, sql: string, params: any[] = []): number {
  try {
    const statement = db.prepare(sql);
    const result = statement.run(...params);
    return result.changes;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Begin a transaction with a callback
export function transaction<T>(db: Database.Database, cb: (db: Database.Database) => T): T {
  const transactionFn = db.transaction(() => {
    return cb(db);
  });
  
  // Execute the transaction
  return transactionFn();
}

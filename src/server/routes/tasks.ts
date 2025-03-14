
import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query, queryOne, execute } from '../database/db';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: number;
  energy_level: number | null;
  created_at: string;
  updated_at: string;
}

export function createTasksRouter(db: Database.Database) {
  const router = Router();
  
  // Middleware for all routes
  router.use(authenticate);
  
  // Get all tasks for current user
  router.get('/', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tasks = query<Task>(db, `
      SELECT id, user_id, title, description, due_date, is_completed, energy_level, created_at, updated_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY due_date, created_at
    `, [userId]);
    
    return res.json(tasks);
  });
  
  // Get a specific task
  router.get('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const task = queryOne<Task>(db, `
      SELECT id, user_id, title, description, due_date, is_completed, energy_level, created_at, updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
    `, [taskId, userId]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json(task);
  });
  
  // Create a new task
  router.post('/', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { title, description, dueDate, energyLevel } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Insert the task
    try {
      execute(db, `
        INSERT INTO tasks (user_id, title, description, due_date, energy_level)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, title, description || null, dueDate || null, energyLevel || null]);
      
      // Get the inserted task
      const result = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
      const taskId = result.id;
      const task = queryOne<Task>(db, 'SELECT * FROM tasks WHERE id = ?', [taskId]);
      
      return res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  });
  
  // Update a task
  router.put('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if task exists and belongs to user
    const existingTask = queryOne<Task>(db, `
      SELECT id FROM tasks WHERE id = ? AND user_id = ?
    `, [taskId, userId]);
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, description, dueDate, isCompleted, energyLevel } = req.body;
    
    // Update the task
    try {
      execute(db, `
        UPDATE tasks
        SET title = ?,
            description = ?,
            due_date = ?,
            is_completed = ?,
            energy_level = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [title, description || null, dueDate || null, isCompleted ? 1 : 0, energyLevel || null, taskId, userId]);
      
      // Get the updated task
      const task = queryOne<Task>(db, 'SELECT * FROM tasks WHERE id = ?', [taskId]);
      
      return res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  });
  
  // Delete a task
  router.delete('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if task exists and belongs to user
    const existingTask = queryOne<Task>(db, `
      SELECT id FROM tasks WHERE id = ? AND user_id = ?
    `, [taskId, userId]);
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete the task
    try {
      execute(db, 'DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });
  
  return router;
}

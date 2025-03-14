
import { Router, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query, queryOne, execute, transaction } from '../database/db';

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  completed_date: string;
  notes: string | null;
  created_at: string;
}

export function createHabitsRouter(db: Database.Database) {
  const router = Router();
  
  // Middleware for all routes
  router.use(authenticate);
  
  // Get all habits for current user
  router.get('/', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const habits = query<Habit>(db, `
      SELECT id, user_id, name, description, is_active, created_at, updated_at
      FROM habits
      WHERE user_id = ?
      ORDER BY name
    `, [userId]);
    
    return res.json(habits);
  });
  
  // Get a specific habit with its completions
  router.get('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const habitId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const habit = queryOne<Habit>(db, `
      SELECT id, user_id, name, description, is_active, created_at, updated_at
      FROM habits
      WHERE id = ? AND user_id = ?
    `, [habitId, userId]);
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Get completions for this habit
    const completions = query<HabitCompletion>(db, `
      SELECT id, habit_id, completed_date, notes, created_at
      FROM habit_completions
      WHERE habit_id = ?
      ORDER BY completed_date DESC
    `, [habitId]);
    
    return res.json({
      ...habit,
      completions
    });
  });
  
  // Create a new habit
  router.post('/', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Insert the habit
    try {
      execute(db, `
        INSERT INTO habits (user_id, name, description)
        VALUES (?, ?, ?)
      `, [userId, name, description || null]);
      
      // Get the inserted habit
      const result = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
      const habitId = result.id;
      const habit = queryOne<Habit>(db, 'SELECT * FROM habits WHERE id = ?', [habitId]);
      
      return res.status(201).json(habit);
    } catch (error) {
      console.error('Error creating habit:', error);
      return res.status(500).json({ error: 'Failed to create habit' });
    }
  });
  
  // Update a habit
  router.put('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const habitId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if habit exists and belongs to user
    const existingHabit = queryOne<Habit>(db, `
      SELECT id FROM habits WHERE id = ? AND user_id = ?
    `, [habitId, userId]);
    
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    const { name, description, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Update the habit
    try {
      execute(db, `
        UPDATE habits
        SET name = ?,
            description = ?,
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [name, description || null, isActive ? 1 : 0, habitId, userId]);
      
      // Get the updated habit
      const habit = queryOne<Habit>(db, 'SELECT * FROM habits WHERE id = ?', [habitId]);
      
      return res.json(habit);
    } catch (error) {
      console.error('Error updating habit:', error);
      return res.status(500).json({ error: 'Failed to update habit' });
    }
  });
  
  // Delete a habit
  router.delete('/:id', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const habitId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if habit exists and belongs to user
    const existingHabit = queryOne<Habit>(db, `
      SELECT id FROM habits WHERE id = ? AND user_id = ?
    `, [habitId, userId]);
    
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Delete the habit (cascade will delete completions)
    try {
      execute(db, 'DELETE FROM habits WHERE id = ? AND user_id = ?', [habitId, userId]);
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting habit:', error);
      return res.status(500).json({ error: 'Failed to delete habit' });
    }
  });
  
  // Mark a habit as complete for a date
  router.post('/:id/complete', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const habitId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { date, notes } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // Check if habit exists and belongs to user
    const existingHabit = queryOne<Habit>(db, `
      SELECT id FROM habits WHERE id = ? AND user_id = ?
    `, [habitId, userId]);
    
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    try {
      const result = transaction(db, (database) => {
        // Check if already completed for this date
        const existingCompletion = queryOne<HabitCompletion>(database, `
          SELECT id FROM habit_completions 
          WHERE habit_id = ? AND completed_date = ?
        `, [habitId, date]);
        
        if (existingCompletion) {
          // Update existing completion
          execute(database, `
            UPDATE habit_completions
            SET notes = ?
            WHERE id = ?
          `, [notes || null, existingCompletion.id]);
          
          const completion = queryOne<HabitCompletion>(database, 'SELECT * FROM habit_completions WHERE id = ?', [existingCompletion.id]);
          return completion;
        } else {
          // Create new completion
          execute(database, `
            INSERT INTO habit_completions (habit_id, completed_date, notes)
            VALUES (?, ?, ?)
          `, [habitId, date, notes || null]);
          
          // Get the inserted completion
          const insertResult = database.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
          const completionId = insertResult.id;
          const completion = queryOne<HabitCompletion>(database, 'SELECT * FROM habit_completions WHERE id = ?', [completionId]);
          
          return completion;
        }
      });
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error completing habit:', error);
      return res.status(500).json({ error: 'Failed to complete habit' });
    }
  });
  
  // Remove a habit completion
  router.delete('/:id/complete/:date', (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const habitId = parseInt(req.params.id);
    const date = req.params.date;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if habit exists and belongs to user
    const existingHabit = queryOne<Habit>(db, `
      SELECT id FROM habits WHERE id = ? AND user_id = ?
    `, [habitId, userId]);
    
    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Delete the completion
    try {
      execute(db, `
        DELETE FROM habit_completions 
        WHERE habit_id = ? AND completed_date = ?
      `, [habitId, date]);
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error removing habit completion:', error);
      return res.status(500).json({ error: 'Failed to remove habit completion' });
    }
  });
  
  return router;
}

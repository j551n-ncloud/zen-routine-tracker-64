
import express from 'express';
import { join } from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createAuthRouter } from './routes/auth';
import { createUsersRouter } from './routes/users';
import { createTasksRouter } from './routes/tasks';
import { createHabitsRouter } from './routes/habits';
import { initializeDatabase } from './database/db';
import { createDefaultUser } from './database/users';

// Initialize database
const db = initializeDatabase();
createDefaultUser(db);

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Apply middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/auth', createAuthRouter(db));
app.use('/api/users', createUsersRouter(db));
app.use('/api/tasks', createTasksRouter(db));
app.use('/api/habits', createHabitsRouter(db));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../../dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

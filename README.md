
# ZenTracker - Task and Habit Management Application

ZenTracker is a full-stack web application for managing tasks and habits, built with Express.js, SQLite, and React.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Task Management**: Create, update, delete, and track tasks
- **Habit Tracking**: Monitor daily habits and build streaks
- **Energy Tracking**: Track your energy levels for optimal productivity
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js
- **Database**: SQLite (file-based)
- **Authentication**: JWT tokens
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

### Quick Start with Docker

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd zentracker
   ```

2. Start the application with Docker Compose
   ```bash
   docker-compose up -d
   ```

3. Access the application
   - Frontend: http://localhost:8080
   - Default credentials: username `admin`, password `admin`

### Development Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npm run dev
   ```

## Data Persistence

The application uses SQLite as its database, which stores all data in a file:

- **Automatic Database Creation**: The SQLite database file is automatically created when the application first starts
- **Docker Persistence**: Data is stored in a volume at `./data` on your host machine
- **Development Mode**: Data is stored in the `data` directory in the project root

This ensures your data persists between container restarts and updates.

## Environment Variables

- `NODE_ENV`: Set to `production` for production deployment
- `JWT_SECRET`: Secret key for JWT token signing (change for production)
- `PORT`: Port for the Express server (defaults to 8080)

## Default User

On first startup, the system automatically creates a default admin user:
- Username: `admin`
- Password: `admin`

**Important**: For production, please change the default credentials immediately after first login.

## Project Structure

- `/src/server`: Backend Express server code
  - `/src/server/database`: Database models and connection
  - `/src/server/routes`: API endpoints
  - `/src/server/middleware`: Express middleware
- `/src/components`: React components
- `/src/hooks`: React custom hooks
- `/src/pages`: Application pages/routes
- `/data`: SQLite database file storage

## Security Notes

- The JWT secret should be changed in production
- The default admin credentials should be changed after first login
- Database is accessible via a Docker volume, ensure proper filesystem permissions

## License

[Specify your license]

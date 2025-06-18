# SMS Management System - Full Stack Monorepo

This repository contains a full-stack application for SMS management, featuring a React frontend with Mantine UI and a Node.js/Express backend with MySQL database.

## Project Structure

```
my-app/
├── client/           # React frontend
├── server/           # Express backend
├── package.json      # Root package.json for managing the monorepo
└── .env              # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- MySQL database

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd reactsms
```

### 2. Environment Setup

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials and other configuration values.

### 3. Install Dependencies

Option A - Use the setup script:

```bash
# Windows
setup.bat

# Unix/Linux/macOS
chmod +x setup.sh
./setup.sh
```

Option B - Manual installation:

```bash
yarn install:all
```

This will install dependencies for the root project, client, and server.

### 4. Database Setup

Make sure your MySQL server is running and you've created a database matching the one specified in your `.env` file.

The server will sync the database schema on startup.

### 5. Development Mode

Start both the frontend and backend concurrently:

```bash
yarn dev
```

This will start:

- Frontend at: http://localhost:3001
- Backend at: http://localhost:8080
- API Documentation at: http://localhost:8080/api-docs

## Scripts

- `yarn dev` - Start both client and server in development mode
- `yarn client` - Start only the client
- `yarn server` - Start only the server
- `yarn install:all` - Install all dependencies
- `yarn build` - Build the React client for production
- `yarn start` - Start the production server
- `yarn test` - Run tests for both client and server
- `yarn lint` - Run linting for both client and server

## Production Deployment

1. Build the client:

   ```bash
   yarn build
   ```

2. Set the environment variable `NODE_ENV=production` in your `.env` file

3. Start the production server:
   ```bash
   yarn start
   ```

In production mode, the Express server will serve the built React app from the `client/build` directory.

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Technologies

### Frontend

- React.js
- Mantine UI
- Axios
- React Router

### Backend

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Swagger UI for API documentation

## License

ISC

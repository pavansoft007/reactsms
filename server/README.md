# School Management System API

A comprehensive School Management System API built with Node.js, Express, Sequelize ORM, and JWT authentication. This system supports multi-branch operations with role-based access control.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **User Management**: Create and manage users with different roles
- **Branch Management**: Support for multiple school branches
- **Academic Management**: Classes, sections, and student management
- **Fee Management**: Fee types, fee collection, and payment tracking
- **Library System**: Book management and issue tracking
- **Role-Based Access Control**: Different permissions for different user roles

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT with refresh tokens
- **Validation**: Express Validator
- **Documentation**: Swagger UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/school-management-system.git
   cd school-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

5. Create the database:

   ```bash
   mysql -u root -p
   CREATE DATABASE multismsdb;
   exit;
   ```

6. Run database migrations:

   ```bash
   npm run db:migrate
   ```

7. Seed initial data:

   ```bash
   npm run db:seed
   ```

8. Start the server:
   ```bash
   npm start
   ```

### Docker Installation

1. Make sure Docker and Docker Compose are installed.

2. Build and start the containers:

   ```bash
   docker-compose up -d
   ```

3. The API will be available at http://localhost:3000.

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

### Main Endpoints

#### Authentication

- `POST /api/auth/login`: Login with email and password
- `POST /api/auth/refresh-token`: Refresh access token
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token

#### User Management

- `POST /api/users`: Create a new user
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user

#### Student Management

- `POST /api/students`: Create a new student
- `GET /api/students`: Get all students
- `GET /api/students/:id`: Get student by ID
- `PUT /api/students/:id`: Update student
- `DELETE /api/students/:id`: Delete student

#### Fee Management

- `POST /api/fees`: Create a new fee
- `GET /api/fees`: Get all fees
- `GET /api/fees/:id`: Get fee by ID
- `PUT /api/fees/:id`: Update fee
- `DELETE /api/fees/:id`: Delete fee
- `POST /api/fees/:id/payments`: Record a payment
- `GET /api/students/:studentId/fees`: Get student fee summary

## Role-Based Access

The system supports the following roles:

- **Admin**: Full access to all features
- **Accountant**: Access to financial modules
- **Teacher**: Access to academic modules
- **Student**: Limited access to their own data
- **Parent**: Access to their children's data

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Rate limiting
- SQL injection protection
- Secure HTTP headers with Helmet.js

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Express.js
- Sequelize ORM
- JWT
- MySQL
- Docker

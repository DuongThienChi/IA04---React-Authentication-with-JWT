# React Authentication with JWT

A full-stack authentication application built with NestJS backend and React frontend, featuring JWT-based authentication with access and refresh tokens.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IA04---React-Authentication-with-JWT
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and generate random JWT secrets
   npm run start:dev
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ia04
JWT_ACCESS_SECRET=<generate-random-hex>
JWT_REFRESH_SECRET=<generate-random-hex>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Available Scripts

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- User registration and login
- JWT-based authentication with access/refresh tokens
- Protected routes
- Automatic token refresh
- Password hashing with bcrypt
- MongoDB data persistence
- TypeScript throughout the stack

## Project Structure

```
├── backend/          # NestJS API server
├── frontend/         # React application
```</content>
<parameter name="filePath">/Users/miketsu/WebAdv/IA04/README.md
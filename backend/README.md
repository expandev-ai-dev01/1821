# StockBox Backend API

Backend REST API for StockBox inventory management system.

## Features

- RESTful API architecture
- TypeScript for type safety
- SQL Server database with automated migrations
- Multi-tenancy support with schema isolation
- Comprehensive error handling
- Request validation with Zod
- CORS configuration for frontend integration

## Prerequisites

- Node.js 18+ and npm
- SQL Server (local or Azure)
- Git

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and configuration.

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

## Database Migrations

Migrations run automatically on server startup. To run migrations manually:
```bash
npm run migrate
```

## Building for Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Code Quality

Run ESLint:
```bash
npm run lint
```

Fix ESLint issues:
```bash
npm run lint:fix
```

## Project Structure

```
backend/
├── migrations/          # SQL migration files
├── src/
│   ├── api/            # API controllers
│   ├── config/         # Configuration
│   ├── middleware/     # Express middleware
│   ├── migrations/     # Migration runner
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.ts       # Application entry point
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## API Documentation

### Health Check

```
GET /health
```

Returns server health status.

### API Versioning

All API endpoints are versioned:
- V1: `/api/v1/`

### Authentication

Authentication will be implemented in future iterations.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DB_SERVER | Database server | localhost |
| DB_PORT | Database port | 1433 |
| DB_NAME | Database name | stockbox |
| DB_USER | Database user | sa |
| DB_PASSWORD | Database password | - |
| PROJECT_ID | Project identifier | stockbox |

## License

ISC

import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { verifyToken } from './jwtMiddleware'; // Import the JWT middleware
import boodschapRoutes from './routes/boodschapRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables from the appropriate .env file based on the environment
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

console.log(`Environment: ${process.env.NODE_ENV}`);

// Create an Express application
const app = express();

// CORS Middleware (move it up before any other middleware)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (allowedOrigins.includes(origin || '') || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// API Key check middleware (run after CORS middleware)
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }
  next();
});

app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Disable SSL for local development
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

declare global {
  namespace Express {
    interface Request {
      db: Pool;
      user?: any; // Add user to the request object
    }
  }
}

app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Mount routes
app.use('/boodschappen', boodschapRoutes);
console.log('boodschapRoutes mounted');

// app.use('/households', verifyToken, householdRoutes); // JWT required for household routes
// console.log('householdRoutes mounted');
app.use('/users', verifyToken, userRoutes); // JWT required for user routes
console.log('userRoutes mounted');

// Root route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('API Running');
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).send('404 - Not Found');
});

const PORT = process.env.PORT || 5000;
console.log(`PORT: ${PORT}`);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Type guard for error handling
export const isError = (err: unknown): err is Error => {
  return (err as Error).message !== undefined;
};

export default app;

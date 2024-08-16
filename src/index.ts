import express from 'express';
import { Pool } from 'pg';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import boodschapRoutes from './routes/boodschapRoutes';
import userRoutes from './routes/userRoutes';
import householdRoutes from './routes/householdRoutes';

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

console.log(`Environment: ${process.env.NODE_ENV}`);

// Middleware

// Update the CORS options to allow your frontend's domain
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (allowedOrigins.includes(origin || '') || !origin) {
      // Allow requests with no origin (like mobile apps or curl requests)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};

// Use CORS middleware with the options
app.use(cors(corsOptions));

app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all requests
app.use(limiter);

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

// Make pool available in request object
declare global {
  namespace Express {
    interface Request {
      db: Pool;
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
app.use('/households', householdRoutes);
console.log('householdRoutes mounted');
app.use('/users', userRoutes);
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
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Type guard for error handling
export const isError = (err: unknown): err is Error => {
  return (err as Error).message !== undefined;
};
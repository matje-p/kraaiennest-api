import express from 'express';
import mongoose from 'mongoose';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import items from './routes/items';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

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
  max: 1000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all requests
app.use(limiter);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

mongoose.connect(mongoURI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Use the items router for /api/items
app.use('/api/items', items);

// Routes placeholder
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Type guard for error handling
const isError = (err: unknown): err is Error => {
  return (err as Error).message !== undefined;
};
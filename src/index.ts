import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
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
const corsOptions = {
  origin: ['https://kraaiennest.vercel.app', 'http://localhost:3000'], // Allow requests from these origins
  optionsSuccessStatus: 200, // For legacy browser support
};


// Apply CORS middleware first
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Type guard for error handling
const isError = (err: unknown): err is Error => {
  return (err as Error).message !== undefined;
};

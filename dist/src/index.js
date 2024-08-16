"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = void 0;
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const boodschapRoutes_1 = __importDefault(require("./routes/boodschapRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const householdRoutes_1 = __importDefault(require("./routes/householdRoutes"));
// import householdRoutes from './routes/householdRoutes';
// import userRoutes from './routes/userRoutes';
// Load environment variables from .env file
dotenv_1.default.config();
// Create an Express application
const app = (0, express_1.default)();
console.log(`Environment: ${process.env.NODE_ENV}`);
// Middleware
// Update the CORS options to allow your frontend's domain
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin || '') || !origin) {
            // Allow requests with no origin (like mobile apps or curl requests)
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};
// Use CORS middleware with the options
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
// Apply rate limiting to all requests
app.use(limiter);
// PostgreSQL connection
const pool = new pg_1.Pool({
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
app.use((req, res, next) => {
    req.db = pool;
    next();
});
// Mount routes
app.use('/boodschappen', boodschapRoutes_1.default);
console.log('boodschapRoutes mounted');
app.use('/households', householdRoutes_1.default);
console.log('householdRoutes mounted');
app.use('/users', userRoutes_1.default);
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
const isError = (err) => {
    return err.message !== undefined;
};
exports.isError = isError;

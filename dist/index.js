"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv_1.default.config({ path: envFile });
// Add debug logging
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Loading env from:', envFile);
console.log('Raw ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
// Then do the rest of your imports
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pg_1 = require("pg");
const jwtMiddleware_1 = require("./jwtMiddleware");
const boodschapRoutes_1 = __importDefault(require("./routes/boodschapRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const householdRoutes_1 = __importDefault(require("./routes/householdRoutes"));
// Create an Express application
const app = (0, express_1.default)();
// CORS Middleware (move it up before any other middleware)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
console.log('Parsed allowed origins:', allowedOrigins);
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin || '') || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};
app.use((0, cors_1.default)(corsOptions));
// API Key check middleware (run after CORS middleware)
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
});
app.use(body_parser_1.default.json());
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
// PostgreSQL connection
const pool = new pg_1.Pool({
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
app.use((req, res, next) => {
    req.db = pool;
    next();
});
// Mount routes
app.use('/boodschappen', jwtMiddleware_1.verifyToken, boodschapRoutes_1.default);
console.log('boodschapRoutes mounted');
app.use('/households', jwtMiddleware_1.verifyToken, householdRoutes_1.default); // JWT required for household routes
console.log('householdRoutes mounted');
app.use('/users', jwtMiddleware_1.verifyToken, userRoutes_1.default); // JWT required for user routes
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
const isError = (err) => {
    return err.message !== undefined;
};
exports.isError = isError;
exports.default = app;

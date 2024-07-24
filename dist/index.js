"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const boodschappen_1 = __importDefault(require("./routes/boodschappen"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
mongoose_1.default.connect(mongoURI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
// // Use the items router for /api/items
app.use('/api/boodschappen', boodschappen_1.default);
// Routes placeholder
app.get('/', (req, res) => res.send('API Running'));
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}, connection string: ${mongoURI}`));
// Type guard for error handling
const isError = (err) => {
    return err.message !== undefined;
};

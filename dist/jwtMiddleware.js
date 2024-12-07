"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const express_oauth2_jwt_bearer_1 = require("express-oauth2-jwt-bearer");
const dotenv_1 = __importDefault(require("dotenv"));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv_1.default.config({ path: envFile });
// Add some debugging to help troubleshoot
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Loading env from:', envFile);
console.log('Process working directory:', process.cwd());
const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;
console.log('Auth0 Configuration:');
console.log('Domain:', auth0Domain);
console.log('Audience:', auth0Audience);
// Create auth middleware
const authMiddleware = (0, express_oauth2_jwt_bearer_1.auth)({
    audience: auth0Audience,
    issuerBaseURL: `https://${auth0Domain}/`,
    tokenSigningAlg: 'RS256'
});
const verifyToken = (req, res, next) => {
    console.log('Processing token for:', req.originalUrl);
    console.log('Authorization header present:', !!req.headers.authorization);
    const token = req.headers.authorization;
    console.log('Token:', token);
    authMiddleware(req, res, (error) => {
        var _a, _b, _c;
        if (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({
                error: 'Authentication failed',
                details: error.message
            });
        }
        req.user = Object.assign({ sub: (_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload.sub }, (_b = req.auth) === null || _b === void 0 ? void 0 : _b.payload);
        console.log('Token verified successfully');
        console.log('Extracted user ID:', (_c = req.auth) === null || _c === void 0 ? void 0 : _c.payload.sub);
        next();
    });
};
exports.verifyToken = verifyToken;
exports.default = exports.verifyToken;

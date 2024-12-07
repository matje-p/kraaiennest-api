import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

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
const authMiddleware = auth({
  audience: auth0Audience,
  issuerBaseURL: `https://${auth0Domain}/`,
  tokenSigningAlg: 'RS256'
});

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Processing token for:', req.originalUrl);
  console.log('Authorization header present:', !!req.headers.authorization);

  const token = req.headers.authorization;
  console.log('Token:', token);
  

  authMiddleware(req, res, (error?: any) => {
    if (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: error.message 
      });
    }

    req.user = {
      sub: req.auth?.payload.sub,  // Extract sub from payload
      ...req.auth?.payload
    };

    console.log('Token verified successfully');
    console.log('Extracted user ID:', req.auth?.payload.sub);
    
    next();
  });
};

export default verifyToken;
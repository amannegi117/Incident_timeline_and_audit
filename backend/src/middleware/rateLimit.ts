import rateLimit from 'express-rate-limit';

// Rate limit for write operations (POST, PUT, DELETE)
export const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many write requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET', // Skip GET requests
});

// Stricter rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for share link creation (Admin only)
export const shareLinkRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 share link creations per hour
  message: {
    error: 'Too many share link creation attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

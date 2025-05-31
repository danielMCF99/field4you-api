import { NextFunction, Request, Response } from 'express';
import { jwtHelper } from '../app';

// Whitelisted routes
const whitelist = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'PUT', path: '/api/auth/reset-password' },
  { method: 'POST', path: '/api/auth/password-recovery' },
  { method: 'GET', path: '/api/sports-venues/' },
];

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if given route is whitelisted
  const isWhitelisted = whitelist.some(
    (route) =>
      route.method === req.method &&
      (route.path === req.path ||
        req.path.includes('/api/auth/reset-password') ||
        req.path.includes('/swagger'))
  );

  if (isWhitelisted) {
    console.log(`Given request does not require authentication: ${req.path}`);
    return next();
  }

  // Extract Bearer token and perform validation
  console.log(`Performing authentication for given request: ${req.path}`);
  const token = await jwtHelper.extractBearerToken(req);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token is missing' });
    return;
  }

  const decodedPayload = await jwtHelper.decodeBearerToken(token);

  if (!decodedPayload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (!decodedPayload.exp || decodedPayload.exp * 1000 < Date.now()) {
    res.status(401).json({ error: 'Unauthorized: Token has expired' });
    return;
  }

  // Attach info for internal communication
  req.headers['x-user-id'] = decodedPayload.userId;
  req.headers['x-user-email'] = decodedPayload.email;
  req.headers['x-user-type'] = decodedPayload.userType;

  return next();
};

import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { serviceConfig } from '../config/env';

// Whitelisted routes
const whitelist = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/reset-password' },
  { method: 'POST', path: '/api/auth/password-recovery' },
];

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if given route is whitelisted
  const isWhitelisted = whitelist.some(
    (route) => route.method === req.method && route.path === req.path
  );

  if (isWhitelisted) {
    console.log(`Given request does not require authentication: ${req.path}`);
    return next();
  }

  // Extract Bearer token and perform validation
  console.log(`Performing authentication for given request: ${req.path}`);
  let token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    // Extract passwordResetToken from URL
    token = req.url.split('/').pop();
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token is missing' });
    return;
  }

  try {
    const baseUrl = serviceConfig['auth' as keyof typeof serviceConfig];
    const url = `${baseUrl}/verify-token`;
    console.log(url);
    axios
      .post(
        url,
        { data: 'your data here' }, // Your request payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Optional, depending on your API
          },
        }
      )
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    return next();
  } catch (error: any) {
    console.log(error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

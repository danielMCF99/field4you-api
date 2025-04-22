import { Request } from 'express';

export interface JwtHelper {
  generateToken(
    userId: string,
    userType: string,
    email: string,
    status: string
  ): Promise<string>;
  extractBearerToken(req: Request): Promise<string | undefined>;
  decodeBearerToken(token: string): Promise<CustomJwtPayload | undefined>;
}

export interface CustomJwtPayload {
  userId: string;
  userType: string;
  email: string;
  status: string;
  iat: number;
  exp: number;
}

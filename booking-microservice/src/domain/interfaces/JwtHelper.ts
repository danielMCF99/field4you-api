import { Request } from "express";

export interface JwtHelper {
  verifyToken(token: string): Promise<string | undefined>;
  extractBearerToken(req: Request): Promise<string | undefined>;
  decodeBearerToken(token: string): Promise<CustomJwtPayload | undefined>;
}

export interface CustomJwtPayload {
  userId: string;
  userType: string;
  email: string;
  iat: number;
  exp: number;
}

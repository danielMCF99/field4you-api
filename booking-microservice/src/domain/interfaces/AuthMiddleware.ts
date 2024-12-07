import { Request } from "express";

export interface AuthMiddleware {
  authenticate(id: string, token: string): Promise<boolean>;
  validateTokenExpirationDate(expiration: number): Promise<boolean>;
  verifyToken(token: string): Promise<string | undefined>;
}

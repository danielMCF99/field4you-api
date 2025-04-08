import { CustomJwtPayload } from './JwtHelper';

export interface AuthMiddleware {
  extractPayload(token: string): Promise<CustomJwtPayload>;
  validateToken(token: string): Promise<boolean>;
  validateUserPermission(
    userId: string,
    userEmail: string,
    token: string
  ): Promise<boolean>;
}

import { decode } from 'jsonwebtoken';
import { jwtHelper } from '../../app';
import { AuthMiddleware } from '../../domain/interfaces/AuthMiddleware';

export class AuthMiddlewareImplementation implements AuthMiddleware {
  private static instance: AuthMiddlewareImplementation;

  private constructor() {}

  public static getInstance(): AuthMiddlewareImplementation {
    if (!AuthMiddlewareImplementation.instance) {
      AuthMiddlewareImplementation.instance =
        new AuthMiddlewareImplementation();
    }

    return AuthMiddlewareImplementation.instance;
  }

  async authenticate(
    authServiceUserId: string,
    userEmail: string,
    token: string
  ): Promise<boolean> {
    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      return false;
    }

    const { userId, userType, email, exp } = decodedPayload;
    if (exp < Date.now()) {
      return false;
    }

    if (!(userType === 'admin')) {
      if (!(email === userEmail) || !(userId === authServiceUserId)) {
        return false;
      }
    }

    return true;
  }
}

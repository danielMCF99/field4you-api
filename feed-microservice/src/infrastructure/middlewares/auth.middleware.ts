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
    creatorId: string,
    token: string
  ): Promise<{ authenticated: boolean }> {
    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      return { authenticated: false };
    }

    const { userId, userType, email, iat, exp } = decodedPayload;
    if (exp < Date.now()) {
      return { authenticated: false };
    }

    if (!(userType === 'admin')) {
      if (!(userId === creatorId)) {
        return {
          authenticated: false,
        };
      }
    }

    return { authenticated: true };
  }
}

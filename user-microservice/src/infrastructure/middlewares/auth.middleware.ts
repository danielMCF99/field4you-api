import { jwtHelper } from '../../app';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { AuthMiddleware } from '../../domain/interfaces/AuthMiddleware';
import { CustomJwtPayload } from '../../domain/interfaces/JwtHelper';

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

  async extractPayload(token: string): Promise<CustomJwtPayload> {
    const decodedPayload = await jwtHelper.decodeBearerToken(token);

    if (decodedPayload) {
      return decodedPayload;
    } else {
      throw new InternalServerErrorException('Error extracting payload');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    const decodedPayload = await jwtHelper.decodeBearerToken(token);
    if (!decodedPayload) {
      return false;
    }

    const { exp } = decodedPayload;
    if (exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  }

  async validateUserPermission(
    authServiceUserId: string,
    userEmail: string,
    token: string
  ): Promise<boolean> {
    const { userId, userType, email } = await this.extractPayload(token);

    if (userType !== 'admin') {
      if (email !== userEmail) {
        return false;
      }
      if (userId !== authServiceUserId) {
        return false;
      }
    }

    return true;
  }
}

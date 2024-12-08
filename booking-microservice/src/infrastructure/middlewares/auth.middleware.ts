import { jwtHelper } from "../../app";
import { AuthMiddleware } from "../../domain/interfaces/AuthMiddleware";

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

  async authenticate(id: string, token: string): Promise<boolean> {
    const decodedPayload = await jwtHelper.decodeBearerToken(token);

    if (!decodedPayload) {
      return false;
    }

    const { userId, userType, email, iat, exp } = decodedPayload;
    const expirationDate = new Date(exp * 1000); // Multiplica por 1000 para converter de segundos para milissegundos

    if (exp * 1000 < Date.now()) {
      return false;
    }

    if (!(id === userId)) {
      return false;
    }

    return true;
  }

  async verifyToken(token: string): Promise<string | undefined> {
    try {
      const payload = await jwtHelper.decodeBearerToken(token);

      if (!payload) {
        return undefined;
      }
      const { userId, exp } = payload;

      if (exp) {
        const tokenExpirationDate = new Date(exp * 1000);
        const currentDate = new Date();

        if (tokenExpirationDate.getTime() < currentDate.getTime()) {
          return undefined;
        }
      }
      return userId;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
  async validateTokenExpirationDate(expiration: number): Promise<boolean> {
    if (expiration < Date.now()) {
      return false;
    }

    return true;
  }
}

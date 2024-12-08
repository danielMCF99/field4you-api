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
    if (exp * 1000 < Date.now()) {
      return false;
    }
    console.log(userId);
    console.log(id);
    if (userType === "user") {
      return false;
    }
    if (id != userId) {
      return false;
    }
    return true;
  }
}

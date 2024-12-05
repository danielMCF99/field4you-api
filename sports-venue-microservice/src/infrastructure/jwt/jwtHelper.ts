import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import config from '../../config/env';
import { CustomJwtPayload, JwtHelper } from '../../domain/interfaces/JwtHelper';

export class JwtHelperImplementation implements JwtHelper {
  private static instance: JwtHelperImplementation;

  private constructor() {}

  public static getInstance(): JwtHelperImplementation {
    if (!JwtHelperImplementation.instance) {
      JwtHelperImplementation.instance = new JwtHelperImplementation();
    }

    return JwtHelperImplementation.instance;
  }

  async verifyToken(token: string): Promise<string | undefined> {
    try {
      const payload = (await jwt.verify(token, config.jwtSecret)) as JwtPayload;

      const { userId, exp } = payload;

      // Validate token expiration date
      if (exp) {
        const tokenExpirationDate = new Date(exp * 1000); // exp claim is a Unix timestamp (seconds since January 1, 1970)
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

  async extractBearerToken(req: Request): Promise<string | undefined> {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    } else {
      return undefined;
    }
  }

  async decodeBearerToken(
    token: string
  ): Promise<CustomJwtPayload | undefined> {
    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        console.log("Invalid token");
        return undefined;
      }
      return decoded as CustomJwtPayload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
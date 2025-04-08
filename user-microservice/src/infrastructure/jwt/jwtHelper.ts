import { Request } from 'express';
import jwt from 'jsonwebtoken';
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

  async extractBearerToken(req: Request): Promise<string | undefined> {
    const authHeader = req.headers.authorization;
    return authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;
  }

  async decodeBearerToken(
    token: string
  ): Promise<CustomJwtPayload | undefined> {
    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        return undefined;
      }
      return decoded as CustomJwtPayload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

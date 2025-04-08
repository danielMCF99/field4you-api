import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { jwtHelper } from '../../app';
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
      const payload = (await jwtHelper.decodeBearerToken(
        token
      )) as CustomJwtPayload;

      if (!payload) {
        return undefined;
      }

      const { exp, userType, userId } = payload;

      if (exp * 1000 < Date.now()) {
        return undefined;
      }

      if (userType === 'user') {
        return undefined;
      }
      return userId;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async extractBearerToken(req: Request): Promise<string | undefined> {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
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
        return undefined;
      }
      return decoded as CustomJwtPayload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

import jwt from 'jsonwebtoken';
import config from '../../config/env';
import { CustomJwtPayload, JwtHelper } from '../../domain/interfaces/JwtHelper';
import { Request } from 'express';

export class JwtHelperImplementation implements JwtHelper {
  private static instance: JwtHelperImplementation;

  private constructor() {}

  public static getInstance(): JwtHelperImplementation {
    if (!JwtHelperImplementation.instance) {
      JwtHelperImplementation.instance = new JwtHelperImplementation();
    }

    return JwtHelperImplementation.instance;
  }

  async generateToken(
    userId: string,
    userType: string,
    email: string
  ): Promise<string> {
    return jwt.sign({ userId, userType, email }, config.jwtSecret, {
      expiresIn: '6h',
    });
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
        console.log('Invalid token');
        return undefined;
      }
      return decoded as CustomJwtPayload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

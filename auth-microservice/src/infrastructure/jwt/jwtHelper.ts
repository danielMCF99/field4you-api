import { randomBytes } from 'crypto';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
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

  async generateToken(
    userId: string,
    userType: string,
    email: string
  ): Promise<string> {
    return jwt.sign({ userId, userType, email }, config.jwtSecret, {
      expiresIn: '1h',
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
        return undefined;
      }
      return decoded as CustomJwtPayload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async generatePasswordResetCode(length: number = 6): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters[bytes[i] % characters.length];
    }

    return result;
  }
}

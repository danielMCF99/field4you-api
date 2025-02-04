import { Request } from 'express';
import { jwtHelper } from '../../app';
import { authMiddleware } from '../../app';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const verifyToken = async (req: Request): Promise<boolean> => {
  const token = await jwtHelper.extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedException('Bearer token required');
  }

  try {
    const isValid = await authMiddleware.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return isValid;
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
};

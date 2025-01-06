import { Request } from 'express';
import mongoose from 'mongoose';
import { jwtHelper } from '../../app';
import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { authMiddleware } from '../../app';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

export const deleteUser = async (
  req: Request,
  repository: IUserRepository
): Promise<{ status: number; message: string }> => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid UserID format.');
  }

  if (!token) {
    throw new UnauthorizedException('Bearer token required');
  }

  try {
    // Get User from Database
    const user = await repository.getById(id);

    if (!user) {
      return {
        status: 404,
        message: 'User with given ID not found',
      };
    }

    // Authenticate user
    const authenticated = await authMiddleware.authenticate(
      id,
      user.email,
      token
    );

    if (!authenticated) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Delete User from Database
    await repository.delete(id);

    return {
      status: 200,
      message: 'User deleted',
    };
  } catch (error: any) {
    console.log(error);
    throw new InternalServerErrorException(error.message);
  }
};

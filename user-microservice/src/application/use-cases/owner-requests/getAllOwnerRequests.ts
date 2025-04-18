import { Request } from 'express';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ownerRequestRepository } from '../../../app';

export const getAllOwnerRequests = async (req: Request) => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!userId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  if (userType === 'admin') {
    throw new BadRequestException('User is already an owner');
  }
  try {
    const ownerRequests = await ownerRequestRepository.getAll();
    return ownerRequests;
  } catch (error: any) {
    if (error.details) {
      throw new BadRequestException(error.details);
    }
    throw new InternalServerErrorException(error.message);
  }
};

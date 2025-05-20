import { Request } from 'express';
import { ownerRequestRepository, userRepository } from '../../../app';
import { OwnerRequest, Status } from '../../../domain/entities/OwnerRequest';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export const createOwnerRequest = async (req: Request) => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  const { message } = req.body;

  if (!userId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const existingUser = await userRepository.getById(userId);

  if (!existingUser) {
    throw new BadRequestException('User does not exist');
  }
  if (existingUser.userType === UserType.owner) {
    throw new BadRequestException('User is already an owner');
  }
  const existingRequests = await ownerRequestRepository.getByUserId(userId);
  const hasPending = existingRequests.some(
    (req) => req.status === Status.pending
  );
  if (hasPending) {
    throw new BadRequestException(
      'There is already a pending request for this user'
    );
  }

  const ownerRequest = new OwnerRequest({
    userId,
    message,
    status: Status.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const newOwnerRequest = await ownerRequestRepository.create(ownerRequest);
    if (!newOwnerRequest) {
      throw new InternalServerErrorException('Failed to create owner request');
    }
    return newOwnerRequest;
  } catch (error) {
    throw new InternalServerErrorException('Failed to create owner request');
  }
};

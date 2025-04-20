import { Request } from 'express';
import { OwnerRequest, Status } from '../../../domain/entities/OwnerRequest';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ownerRequestRepository, userRepository } from '../../../app';

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
  if (existingUser.userType === 'owner') {
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
    submittedAt: new Date(),
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

import { Request } from 'express';
import { ownerRequestRepository, userRepository } from '../../../app';
import { OwnerRequest, Status } from '../../../domain/entities/OwnerRequest';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { createNotification } from '../notifications/createNotification';

export const createOwnerRequest = async (
  req: Request
): Promise<OwnerRequest> => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  const userEmail = req.headers['x-user-email'] as string | undefined;
  const { message } = req.body;

  if (!userId || !userType || !userEmail) {
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

  console.log(`Create Owner Request: userId = ${userId}`);
  const ownerRequest = new OwnerRequest({
    userId,
    userEmail,
    message,
    status: Status.pending,
  });

  try {
    const newOwnerRequest = await ownerRequestRepository.create(ownerRequest);
    if (!newOwnerRequest) {
      throw new InternalServerErrorException('Failed to create owner request');
    }

    // Create notification
    createNotification({
      userId: ownerRequest.getOwnerId(),
      ownerRequestId: ownerRequest.getId(),
      userEmail: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      adminOnly: true,
    });

    return newOwnerRequest;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException('Unexpected Error');
  }
};

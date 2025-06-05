import { Request } from 'express';
import mongoose from 'mongoose';
import { ownerRequestRepository, userRepository } from '../../../app';
import { OwnerRequest, Status } from '../../../domain/entities/OwnerRequest';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { publishUserUpdate } from '../../../infrastructure/rabbitmq/rabbitmq.publisher';
import { createNotification } from '../notifications/createNotification';

export const updateOwnerRequest = async (
  req: Request
): Promise<OwnerRequest> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const authenticatedUserType = req.headers['x-user-type'] as
    | string
    | undefined;
  const authenticatedUserEmail = req.headers['x-user-email'] as
    | string
    | undefined;

  if (!authenticatedUserType || !authenticatedUserEmail) {
    throw new UnauthorizedException('Unauthorized');
  }

  const { id } = req.params;
  const { status, response } = req.body;

  if (!status) {
    throw new BadRequestException('Status is required');
  }

  const validStatuses = [Status.approved, Status.rejected];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(
      'Status must be either "approved" or "rejected"'
    );
  }

  const ownerRequest = await ownerRequestRepository.get(id);
  if (!ownerRequest) {
    throw new NotFoundException('Owner Request not found');
  }

  if (ownerRequest.status !== Status.pending) {
    throw new BadRequestException('Only pending owner requests can be updated');
  }

  if (authenticatedUserType !== UserType.admin) {
    throw new ForbiddenException(
      'Only admins can update the status of owner requests'
    );
  }

  try {
    const updatedOwnerRequest = await ownerRequestRepository.updateStatus(
      id,
      status,
      authenticatedUserEmail,
      response,
      session
    );

    if (status === Status.approved) {
      await userRepository.updateType(
        ownerRequest.userId,
        UserType.owner,
        session
      );
      await publishUserUpdate({
        userId: ownerRequest.userId.toString(),
        updatedData: { userType: UserType.owner },
      });
    }

    // Create notification
    const user = await userRepository.getById(ownerRequest.getOwnerId());

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let notificationContent;
    if (!response) {
      notificationContent = response;
    } else {
      notificationContent =
        status === Status.approved
          ? 'Your request to be an owner was approved'
          : 'Your request to be an owner was not approved';
    }

    createNotification({
      userId: ownerRequest.getOwnerId(),
      userEmail: user.email,
      phoneNumber: user.phoneNumber,
      content: notificationContent,
      adminOnly: false,
    });

    // Commit DB Transaction
    await session.commitTransaction();
    session.endSession();

    return updatedOwnerRequest;
  } catch (error: any) {
    // Abort DB Transaction
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    throw new InternalServerErrorException('Internal Server Error');
  }
};

import mongoose from 'mongoose';
import { Request } from 'express';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { ownerRequestRepository, userRepository } from '../../../app';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { publishUserUpdate } from '../../../infrastructure/middlewares/rabbitmq.publisher';
import { UserType } from '../../../domain/entities/User';

export const updateOwnerRequest = async (req: Request) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!userId || !userType) {
    throw new UnauthorizedException('Unauthorized');
  }

  const { id } = req.params;
  const { status, response } = req.body;

  if (!status) {
    throw new BadRequestException('Status is required');
  }

  const validStatuses = ['approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(
      'Status must be either "approved" or "rejected"'
    );
  }

  const ownerRequest = await ownerRequestRepository.get(id);
  if (!ownerRequest) {
    throw new NotFoundException('Owner Request not found');
  }
  if (ownerRequest.status !== 'pending') {
    throw new BadRequestException('Only pending owner requests can be updated');
  }
  if (userType !== 'admin') {
    throw new ForbiddenException(
      'Only admins can update the status of owner requests'
    );
  }
  try {
    const updatedOwnerRequest = await ownerRequestRepository.updateStatus(
      id,
      status,
      userId,
      response,
      session
    );
    if (status === 'approved') {
      await userRepository.updateType(ownerRequest.userId, 'owner', session);
      await publishUserUpdate({
        userId: ownerRequest.userId.toString(),
        updatedData: { userType: UserType.owner },
      });
    }
    await session.commitTransaction();
    session.endSession();
    return updatedOwnerRequest;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    throw new InternalServerErrorException('Internal Server Error');
  }
};

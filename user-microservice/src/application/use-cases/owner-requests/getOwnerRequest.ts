import { Request } from 'express';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { ownerRequestRepository } from '../../../app';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';

export const getOwnerRequest = async (req: Request) => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!userId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const { id } = req.params;
  if (!id) {
    throw new BadRequestException('Id is required');
  }
  try {
    const ownerRequest = await ownerRequestRepository.get(id);
    if (!ownerRequest) {
      throw new NotFoundException('Owner Request not found');
    }
    if (userType !== 'admin' && userId !== ownerRequest.userId.toString()) {
      throw new ForbiddenException('You can only view your own requests');
    }

    return ownerRequest;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};

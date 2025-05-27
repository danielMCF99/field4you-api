import { Request } from 'express';
import { ownerRequestRepository, userRepository } from '../../../app';
import { OwnerRequestDetailResponse } from '../../../domain/dto/ownerRequest-detail.dto';
import { UserType } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';

export const getOwnerRequest = async (
  req: Request
): Promise<OwnerRequestDetailResponse> => {
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
    if (
      userType !== UserType.admin &&
      userId !== ownerRequest.userId.toString()
    ) {
      throw new ForbiddenException('You can only view your own requests');
    }

    const user = await userRepository.getById(ownerRequest.getOwnerId());
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ownerRequest: ownerRequest,
      userDetails: {
        name: user.firstName + ' ' + user.lastName,
        profilePicture: user.imageURL,
        email: user.email,
        phoneNumber: user.phoneNumber,
        birthDate: new Date(user.birthDate).toISOString().split('T')[0],
        location: user.getLocation(),
      },
    };
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};

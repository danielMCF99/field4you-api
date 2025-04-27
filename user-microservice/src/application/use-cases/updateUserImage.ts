import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository, firebase } from '../../app';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { User } from '../../domain/entities/User';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const updateUserImage = async (req: Request): Promise<User> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID format');
  }

  const requestUserId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!req.file) {
    throw new BadRequestException('Image is required');
  }

  let user;
  if (userType != 'admin') {
    if (id != requestUserId) {
      throw new UnauthorizedException(
        'User is only able to update its own image'
      );
    }

    user = await userRepository.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  } else {
    user = await userRepository.getById(id);
  }

  try {
    const uploadResult = await firebase.uploadFileToFirebase(req);

    if (!uploadResult) {
      throw new BadRequestException('Upload result is undefined');
    }

    const { imageURL, fileName } = uploadResult;

    if (!imageURL || !fileName) {
      throw new BadRequestException('Upload result is missing required data');
    }

    const updatedUser = await userRepository.updateUserImage(id, {
      fileName,
      imageURL,
    });

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update user image');
    }

    return updatedUser;
  } catch (error) {
    throw new InternalServerErrorException(
      'Unexpected error during image update'
    );
  }
};

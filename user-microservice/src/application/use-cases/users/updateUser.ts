import { Request } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../../../app';
import { User } from '../../../domain/entities/User';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';
import { publishUserUpdate } from '../../../infrastructure/rabbitmq/rabbitmq.publisher';
import { getCoordinatesFromAddress } from '../../../infrastructure/utils/getCoordinatesFromAddress';

export const updateUser = async (req: Request): Promise<User> => {
  const id = req.params.id.toString();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID format');
  }

  const authUserId = req.headers['x-user-id'] as string | undefined;
  if (!authUserId) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  const user = await userRepository.getById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userType = req.headers['x-user-type'] as string | undefined;
  if (userType != 'admin') {
    if (user.getId() != authUserId) {
      throw new UnauthorizedException(
        "You don't have permission to edit this user"
      );
    }
  }

  const locationFields = [
    'district',
    'city',
    'address',
    'latitude',
    'longitude',
  ];
  const rootFields = ['phoneNumber'];
  const updatedData: Record<string, any> = {};
  const updatedLocation: Record<string, any> = {};

  Object.entries(req.body).forEach(([key, value]) => {
    if (locationFields.includes(key)) {
      updatedLocation[key] = value;
    } else if (rootFields.includes(key)) {
      updatedData[key] = value;
    }
  });

  const locationToUse = {
    address: updatedLocation.address ?? user.location.address,
    city: updatedLocation.city ?? user.location.city,
    district: updatedLocation.district ?? user.location.district,
  };

  const addressChanged =
    updatedLocation.address || updatedLocation.city || updatedLocation.district;

  if (addressChanged) {
    try {
      const coords = await getCoordinatesFromAddress(
        locationToUse.address,
        locationToUse.city,
        locationToUse.district
      );
      updatedLocation.latitude = coords.latitude;
      updatedLocation.longitude = coords.longitude;
    } catch (err) {
      const error = err as Error;
      console.log('Could not update coordinates:', error.message);
    }
  }

  if (Object.keys(updatedLocation).length > 0) {
    updatedData.location = {
      ...user.location,
      ...updatedLocation,
    };
  }

  try {
    const updatedUser = await userRepository.update(user.getId(), updatedData);

    if (!updatedUser) {
      throw new InternalServerErrorException(
        'Internal server error when updating the user'
      );
    }

    publishUserUpdate({ userId: id, updatedData });

    return updatedUser;
  } catch (error) {
    console.log(error);
    throw new InternalServerErrorException(
      'Internal server error when updating the user'
    );
  }
};

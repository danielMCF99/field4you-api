  import { Request } from 'express';
  import mongoose from 'mongoose';
  import { userRepository } from '../../app';
  import { v4 as uuidv4 } from 'uuid';
  import { NotFoundException } from '../../domain/exceptions/NotFoundException';
  import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
  import { BadRequestException } from '../../domain/exceptions/BadRequestException';
  import { User } from '../../domain/entities/User';
  
  export const updateUserImage = async (req: Request): Promise<User> => {
    const id = req.params.id.toString();
    const { imageURL } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if(!req.file) {
      throw new BadRequestException('Image is required');
    }

    const user = await userRepository.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const generatedImageName = `${now}_${uuidv4()}`;
  
    try {
      const updatedUser = await userRepository.updateUserImage(id,  {
        imageName: generatedImageName,
        imageURL,
      });
  
      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update user image');
      }
  
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error during image update');
    }
  };
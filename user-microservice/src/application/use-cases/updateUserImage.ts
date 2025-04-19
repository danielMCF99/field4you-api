  import { Request } from 'express';
  import mongoose from 'mongoose';
  import { userRepository, firebase } from '../../app';
  import { NotFoundException } from '../../domain/exceptions/NotFoundException';
  import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
  import { BadRequestException } from '../../domain/exceptions/BadRequestException';
  import { User } from '../../domain/entities/User';
  
  export const updateUserImage = async (req: Request): Promise<User> => {
    const id = req.params.id.toString();
    const uploadResult = await firebase.uploadFileToFirebase(req);
  
    if (!uploadResult) {
      throw new BadRequestException('Failed to upload image to Firebase');
    }

    const { imageURL, fileName } = uploadResult;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if(!req.file) {
      throw new BadRequestException('Image is required');
    }

    if (!imageURL) {
      throw new BadRequestException('Failed to upload image to Firebase');
    }

    const user = await userRepository.getById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    try {
      const updatedUser = await userRepository.updateUserImage(id,  {
        imageName: fileName,
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
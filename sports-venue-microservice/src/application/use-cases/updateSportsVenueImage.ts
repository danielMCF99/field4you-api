  import { Request } from 'express';
  import mongoose from 'mongoose';
  import { sportsVenueRepository, firebase } from '../../app';
  import { NotFoundException } from '../../domain/exceptions/NotFoundException';
  import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
  import { BadRequestException } from '../../domain/exceptions/BadRequestException';
  import { SportsVenue } from '../../domain/entities/sports-venue';
  
  export const updateSportsVenueImage = async (req: Request): Promise<SportsVenue> => {
    const id = req.params.id.toString();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const sportsVenue = await sportsVenueRepository.findById(id);
    if (!sportsVenue) {
      throw new NotFoundException('Sports Venue not found');
    }
  
    try {
      const uploadResults = await firebase.uploadFilesToFirebase(req);
  
      if (!uploadResults || uploadResults.length === 0) {
        throw new BadRequestException('Upload failed');
      }
  
      const updatedImages = [...(sportsVenue.sportsVenuePictures || []), ...uploadResults];
  
      const updatedSportsVenue = await sportsVenueRepository.updateSportsVenueImage(id, {
        sportsVenuePictures: updatedImages,
      });  
  
      if (!updatedSportsVenue) {
        throw new InternalServerErrorException('Failed to update Sports Venue images');
      }
  
      return updatedSportsVenue;
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error during images updates');
    }
  };
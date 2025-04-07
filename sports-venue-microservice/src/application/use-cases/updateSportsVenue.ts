import { Request } from "express";
import mongoose from "mongoose";
import { authMiddleware, jwtHelper, sportsVenueRepository } from "../../app";
import { SportsVenue } from "../../domain/entities/sports-venue";
import { NotFoundException } from "../../domain/exceptions/NotFoundException";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { publishSportsVenueUpdate } from "../../infrastructure/middlewares/rabbitmq.publisher";

export const updateSportsVenue = async (
  req: Request
): Promise<{ status: number; message: string; sportsVenue?: SportsVenue }> => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);
    const updatedData = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }

    if (!token) {
      throw new UnauthorizedException("Authentication token is required");
    }
    const sportsVenue = await sportsVenueRepository.findById(id);
    if (!sportsVenue) {
      throw new NotFoundException("Sports Venue not found");
    }
    if (!sportsVenue.ownerId) {
      throw new NotFoundException("Owner not found");
    }

    const authenticated = await authMiddleware.authenticate(
      sportsVenue.ownerId,
      token
    );
    if (!authenticated) {
      throw new UnauthorizedException("Authentication failed");
    }

    const updatedSportsVenue = await sportsVenueRepository.update(id, {
      ...sportsVenue,
      ...updatedData,
    });

    if (!updatedSportsVenue) {
      throw new InternalServerErrorException("Failed to update Sports Venue");
    }
    await publishSportsVenueUpdate({
      sportsVenueId: id,
      ownerId: sportsVenue.ownerId,
      updatedData,
    });
    return {
      status: 200,
      message: "Sports Venue updated successfully",
      sportsVenue: updatedSportsVenue,
    };
  } catch (error: any) {
    throw new InternalServerErrorException(
      error.message || "Internal server error"
    );
  }
};

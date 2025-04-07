import { Request } from "express";
import mongoose from "mongoose";
import { authMiddleware, jwtHelper, sportsVenueRepository } from "../../app";
import { BadRequestException } from "../../domain/exceptions/BadRequestException";
import { ForbiddenException } from "../../domain/exceptions/ForbiddenException";
import { InternalServerErrorException } from "../../domain/exceptions/InternalServerErrorException";
import { NotFoundException } from "../../domain/exceptions/NotFoundException";
import { UnauthorizedException } from "../../domain/exceptions/UnauthorizedException";
import { publishSportsVenueDeletion } from "../../infrastructure/middlewares/rabbitmq.publisher";

export const deleteSportsVenue = async (
  req: Request
): Promise<{ status: number; message: string }> => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }

    if (!token) {
      throw new UnauthorizedException("Authentication token is required");
    }

    const ownerId = await jwtHelper.verifyToken(token);
    if (!ownerId) {
      throw new UnauthorizedException("Invalid authentication token");
    }

    const sportsVenue = await sportsVenueRepository.findById(id);
    if (!sportsVenue) {
      throw new NotFoundException("Sports Venue with given ID not found");
    }

    if (sportsVenue.ownerId.toString() !== ownerId.toString()) {
      throw new ForbiddenException(
        "User is not authorized to delete this venue"
      );
    }

    const isDeleted = await sportsVenueRepository.delete(id);
    if (!isDeleted) {
      throw new InternalServerErrorException("Error when deleting resource");
    }

    await publishSportsVenueDeletion({ sportsVenueId: id, ownerId });
    return { status: 200, message: "Sports Venue Deleted" };
  } catch (error: any) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException ||
      error instanceof NotFoundException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(
      "Something went wrong with sports-venue delete"
    );
  }
};

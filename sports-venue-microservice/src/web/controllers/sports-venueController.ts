import { Request, Response } from "express";
import { SportsVenue } from "../../domain/entities/sports-venue";
import { jwtHelper,sportsVenueRepository } from "../../app";
import { createSportsVenue } from "../../application/use-cases/createSportsVenue";
import { updateSportsVenue } from "../../application/use-cases/updateSportsVenue";
import { getSportsVenueById } from "../../application/use-cases/getSportsVenueById";
import { deleteSportsVenue } from "../../application/use-cases/deleteSportsVenue";

export const createSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const token = await jwtHelper.extractBearerToken(req);
    const {
      ownerId,
      location,
      sportsVenueType,
      status,
      sportsVenueName,
      bookingMinDuration,
      bookingMinPrice,
      sportsVenuePicture,
      hasParking,
      hasShower,
      hasBar,
    } = req.body;

    if (!token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }

    const sportsVenue = new SportsVenue({
      ownerId,
      location,
      sportsVenueType,
      status,
      sportsVenueName,
      bookingMinDuration,
      bookingMinPrice,
      sportsVenuePicture,
      hasParking,
      hasShower,
      hasBar,
    });

    const newSportsVenue = await createSportsVenue(
      token,
      sportsVenue,
      sportsVenueRepository
    );
    res.status(201).json({ message: "Sports venue created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating sports-venue" });
  }
};

export const updateSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedSportsVenue = await updateSportsVenue(
      id,
      updatedData,
      sportsVenueRepository
    );

    if (!updatedSportsVenue) {
      res.status(404).json({ message: "Sports venue not found" });
    }

    res.status(200).json({
      message: "Sports venue updated successfully",
      data: updatedSportsVenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating sports-venue" });
  }
};

export const deleteSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const deletedSportsVenue = await deleteSportsVenue(id, sportsVenueRepository);

    if (!deletedSportsVenue) {
      res.status(404).json({ message: "Sports venue not found" });
    }

    res.status(200).json(deletedSportsVenue);
  } catch (error) {
    res.status(500).json({ message: "Error deleting sports-venue" });
  }
};

export const getSportsVenueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const sportsVenue = await getSportsVenueById(id, sportsVenueRepository);

    if (!sportsVenue) {
      res.status(404).json({ message: "Sports venue not found" });
    }

    res.status(200).json(sportsVenue);
  } catch (error) {
    res.status(500).json({ message: "Error getting sports-venue by id" });
  }
};

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SportsVenue } from '../../domain/entities/sports-venue';
import { jwtHelper, sportsVenueRepository } from '../../app';
import { createSportsVenue } from '../../application/use-cases/createSportsVenue';
import { updateSportsVenue } from '../../application/use-cases/updateSportsVenue';
import { getSportsVenueById } from '../../application/use-cases/getSportsVenueById';
import { deleteSportsVenue } from '../../application/use-cases/deleteSportsVenue';
import { getAllSportsVenue } from '../../application/use-cases/getAllSportsVenue';

export const createSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const token = await jwtHelper.extractBearerToken(req);

    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }

    const {
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

    if (
      !location ||
      !sportsVenueType ||
      !status ||
      !sportsVenueName ||
      !bookingMinDuration ||
      !bookingMinPrice ||
      !sportsVenuePicture
    ) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const sportsVenue = new SportsVenue({
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

    if (!newSportsVenue) {
      res.status(500).json({ message: 'Error creating sports-venue' });
      return;
    }

    res.status(201).json({ message: 'Sports venue created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sports-venue' });
  }
};

export const updateSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id.toString();
    const token = await jwtHelper.extractBearerToken(req);
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }

    const updatedSportsVenue = await updateSportsVenue(
      id,
      token,
      updatedData,
      sportsVenueRepository
    );

    if (!updatedSportsVenue) {
      res.status(404).json({ message: 'Sports venue not found' });
      return;
    }

    res.status(200).json({
      message: 'Sports venue updated successfully',
      data: updatedSportsVenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sports-venue' });
  }
};

export const deleteSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const token = await jwtHelper.extractBearerToken(req);

    if (!token) {
      res.status(401).json({ message: 'Bearer token required' });
      return;
    }
    const { status, message } = await deleteSportsVenue(
      id,
      token,
      sportsVenueRepository
    );

    res.status(status).json({ message: message });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sports-venue' });
  }
};

export const getSportsVenueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id.toString();

    const sportsVenue = await getSportsVenueById(id, sportsVenueRepository);

    if (!sportsVenue) {
      res.status(404).json({ message: 'Sports venue not found' });
      return;
    }

    res.status(200).json(sportsVenue);
  } catch (error) {
    res.status(500).json({ message: 'Error getting sports-venue by id' });
  }
};

export const getAllSportsVenueController = async (
  _req: Request,
  res: Response
) => {
  try {
    const allSportsVenue = await getAllSportsVenue(sportsVenueRepository);

    res.status(200).json({ SportsVenue: allSportsVenue });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Sports-Venue: ' });
  }
};

import { Request, Response } from 'express';
import { createSportsVenue } from '../../application/use-cases/createSportsVenue';
import { deleteSportsVenue } from '../../application/use-cases/deleteSportsVenue';
import { deleteSportsVenueImage } from '../../application/use-cases/deleteSportsVenueImage';
import { getAllSportsVenue } from '../../application/use-cases/getAllSportsVenue';
import { getSportsVenueById } from '../../application/use-cases/getSportsVenueById';
import { updateSportsVenue } from '../../application/use-cases/updateSportsVenue';
import { updateSportsVenueRating } from '../../application/use-cases/updateSportsVenueRating';
import { updateSportsVenueStatus } from '../../application/use-cases/updateSportsVenueStatus';
import { updateSportsVenueImage } from '../../application/use-cases/updateSportsVenueImage';

export const createSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await createSportsVenue(req);
    res.status(201).json({ sportsVenue });
    return;
  } catch (error: any) {
    if (error.details) {
      res
        .status(error.statusCode)
        .json({ message: error.message, details: error.details });
      return;
    }

    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await updateSportsVenue(req);
    res.status(200).json({ sportsVenue });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateSportsVenueStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await updateSportsVenueStatus(req);
    res.status(200).json({ sportsVenue });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const deleteSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteSportsVenue(req);
    res.status(200).json({});
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const deleteSportsVenueImageController = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteSportsVenueImage(req);
    res.status(200).json({});
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateSportsVenueImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await updateSportsVenueImage(req);
    res.status(200).json({ sportsVenue });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getSportsVenueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await getSportsVenueById(req);
    res.status(200).json(sportsVenue);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getAllSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const allSportsVenue = await getAllSportsVenue(req.query);
    res.status(200).json({ sportVenues: allSportsVenue });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateSportsVenueRatingController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await updateSportsVenueRating(req);
    res.status(200).json(sportsVenue);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

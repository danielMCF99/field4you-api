import { Request, Response } from 'express';
import { createSportsVenue } from '../../application/use-cases/createSportsVenue';
import { deleteSportsVenue } from '../../application/use-cases/deleteSportsVenue';
import { getAllSportsVenue } from '../../application/use-cases/getAllSportsVenue';
import { getSportsVenueById } from '../../application/use-cases/getSportsVenueById';
import { updateSportsVenue } from '../../application/use-cases/updateSportsVenue';
import { updateSportsVenueStatus } from '../../application/use-cases/updateSportsVenueStatus';
import { SportsVenueFilterParams } from '../../domain/dto/sports-venue-filter.dto';

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

export const getSportsVenueByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const sportsVenue = await getSportsVenueById(req);
    res.status(200).json(sportsVenue);
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
  }
};

export const getAllSportsVenueController = async (
  req: Request,
  res: Response
) => {
  try {
    const { sportsVenueName, page, limit, status, sportsVenueType } = req.query;

    const filters: SportsVenueFilterParams = {
      sportsVenueName: sportsVenueName?.toString(),
      status: status?.toString(),
      sportsVenueType: sportsVenueType?.toString(),
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    };

    const allSportsVenue = await getAllSportsVenue(filters);
    res.status(200).json({ sportVenues: allSportsVenue });
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
  }
};

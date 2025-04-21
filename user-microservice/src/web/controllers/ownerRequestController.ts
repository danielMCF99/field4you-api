import { Request, Response } from 'express';
import { createOwnerRequest } from '../../application/use-cases/owner-requests/createOwnerRequest';
import { getAllOwnerRequests } from '../../application/use-cases/owner-requests/getAllOwnerRequests';
import { getOwnerRequest } from '../../application/use-cases/owner-requests/getOwnerRequest';
import { getOwnerRequestsByUserId } from '../../application/use-cases/owner-requests/getOwnerRequestsByUserId';
import { updateOwnerRequest } from '../../application/use-cases/owner-requests/updateOwnerRequest';

export const createOwnerRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerRequest = await createOwnerRequest(req);
    res.status(201).json({ ownerRequest });
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

export const getAllOwnerRequestsController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerRequests = await getAllOwnerRequests(req);
    res.status(200).json({ ownerRequests });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getOwnerRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerRequest = await getOwnerRequest(req);
    res.status(200).json({ ownerRequest });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getOwnerRequestsByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerRequests = await getOwnerRequestsByUserId(req);
    res.status(200).json({ ownerRequests });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateOwnerRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerRequest = await updateOwnerRequest(req);
    console.log(ownerRequest);
    res.status(200).json({ ownerRequest });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

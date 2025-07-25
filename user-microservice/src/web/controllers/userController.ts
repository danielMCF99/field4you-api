import { Request, Response } from 'express';
import { deleteUser } from '../../application/use-cases/users/deleteUser';
import { getAll } from '../../application/use-cases/users/getAll';
import { getById } from '../../application/use-cases/users/getById';
import { updateUser } from '../../application/use-cases/users/updateUser';
import { updateUserImage } from '../../application/use-cases/users/updateUserImage';
import { updateUserStatus } from '../../application/use-cases/users/updateUserStatus';

export const getAllController = async (req: Request, res: Response) => {
  try {
    const allUsers = await getAll(req.query);
    res.status(200).json(allUsers);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getByIdController = async (req: Request, res: Response) => {
  try {
    const user = await getById(req);
    res.status(200).json(user);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const user = await updateUser(req);
    res.status(200).json(user);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteUser(req);
    res.status(200).json({
      deleted: deleted,
      message: 'User was deleted',
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateUserImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await updateUserImage(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await updateUserStatus(req);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

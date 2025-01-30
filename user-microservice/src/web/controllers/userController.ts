import { Request, Response } from 'express';
import { getAll } from '../../application/use-cases/getAll';
import { getById } from '../../application/use-cases/getById';
import { updateUser } from '../../application/use-cases/updateUser';
import { deleteUser } from '../../application/use-cases/deleteUser';

export const getAllController = async (req: Request, res: Response) => {
  try {
    const users = await getAll(req);
    res.status(200).json({
      users: users,
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const getByIdController = async (req: Request, res: Response) => {
  try {
    const user = await getById(req);
    res.status(200).json({
      user: user,
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const user = await updateUser(req);
    res.status(200).json({
      user: user,
    });
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
    });
    return;
  } catch (error: any) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
};

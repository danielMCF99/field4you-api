import { Request, Response } from 'express';
import { deleteUser } from '../../application/use-cases/users/deleteUser';
import { getAll } from '../../application/use-cases/users/getAll';
import { getById } from '../../application/use-cases/users/getById';
import { updateUser } from '../../application/use-cases/users/updateUser';

export const getAllController = async (
  req: Request, 
  res: Response
) => {
  try {
    const allUsers = await getAll(req.query);
    res.status(200).json({ users: allUsers });
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

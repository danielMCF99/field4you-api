import { Request, Response } from 'express';
import { deleteUser } from '../../application/use-cases/deleteUser';
import { getAll } from '../../application/use-cases/getAll';
import { getById } from '../../application/use-cases/getById';
import { updateUser } from '../../application/use-cases/updateUser';
import { UserFilterParams } from '../../domain/dto/user-filter.dto';

export const getAllController = async (
  req: Request, 
  res: Response
) => {
  try {
    const { firstName, userType, limit, page } = req.query;

    const filters: UserFilterParams = {
      firstName: firstName?.toString(),
      userType: userType?.toString(),
      limit: limit ? parseInt(limit.toString()) : undefined,
      page: page ? parseInt(page.toString()) : undefined
    };

    const allUsers = await getAll(filters);
    res.status(200).json({ users: allUsers });
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

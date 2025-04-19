import { Request } from 'express';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ownerRequestRepository } from '../../../app';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';

export const getAllOwnerRequests = async (req: Request) => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!userId || !userType) {
    throw new InternalServerErrorException('Internal Server Error');
  }

  if (userType !== 'admin') {
    throw new ForbiddenException('Only admins can access all owner requests');
  }

  try {
    const { status, startDate, endDate, sortBy, order, page, limit } =
      req.query;

    const filters = {
      status: status?.toString(),
      startDate: startDate ? new Date(startDate.toString()) : undefined,
      endDate: endDate ? new Date(endDate.toString()) : undefined,
      sortBy: sortBy?.toString() as 'createdAt' | 'status',
      order: order?.toString() as 'asc' | 'desc',
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 10,
    };

    const ownerRequests = await ownerRequestRepository.getAll(filters);
    return ownerRequests;
  } catch (error: any) {
    if (error.details) {
      throw new BadRequestException(error.details);
    }
    throw new InternalServerErrorException(error.message);
  }
};

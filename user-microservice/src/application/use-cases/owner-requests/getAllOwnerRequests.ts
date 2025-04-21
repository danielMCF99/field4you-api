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

    const toDateEndOfDayIfNoTime = (dateStr?: string): Date | undefined => {
      if (!dateStr) return undefined;

      const date = new Date(dateStr);
      const isMidnight =
        date.getHours() === 0 &&
        date.getMinutes() === 0 &&
        date.getSeconds() === 0 &&
        date.getMilliseconds() === 0;

      if (isMidnight) {
        date.setHours(23, 59, 59, 999);
      }

      return date;
    };

    const filters = {
      status: status?.toString(),
      startDate: startDate ? new Date(startDate.toString()) : undefined,
      endDate: toDateEndOfDayIfNoTime(endDate?.toString()),
      sortBy: (sortBy?.toString() as 'createdAt' | 'status') ?? 'createdAt',
      order: (order?.toString() as 'asc' | 'desc') ?? 'desc',
      page: parseInt(page?.toString() || '1'),
      limit: parseInt(limit?.toString() || '10'),
    };

    const ownerRequests = await ownerRequestRepository.getAll(filters);
    return ownerRequests;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};

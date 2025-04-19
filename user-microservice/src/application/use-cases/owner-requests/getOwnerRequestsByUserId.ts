import { Request } from 'express';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { BadRequestException } from '../../../domain/exceptions/BadRequestException';
import { ownerRequestRepository } from '../../../app';

export async function getOwnerRequestsByUserId(req: Request) {
  const userIdHeader = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;
  if (!userIdHeader || !userType) {
    throw new InternalServerErrorException('Internal Server Erro');
  }
  const { userId } = req.params;
  if (userType !== 'admin' && userIdHeader !== userId) {
    throw new ForbiddenException('You can only view your own requests');
  }
  try {
    const ownerRequests = await ownerRequestRepository.getByUserId(userId);
    return ownerRequests;
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
}

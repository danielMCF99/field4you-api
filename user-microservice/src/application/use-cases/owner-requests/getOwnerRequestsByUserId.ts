import { Request } from 'express';
import { ownerRequestRepository } from '../../../app';
import { AllOwnerRequestsResponse } from '../../../domain/dto/all-ownerRequest.dto';
import { UserType } from '../../../domain/entities/User';
import { ForbiddenException } from '../../../domain/exceptions/ForbiddenException';
import { InternalServerErrorException } from '../../../domain/exceptions/InternalServerErrorException';

export async function getOwnerRequestsByUserId(
  req: Request
): Promise<AllOwnerRequestsResponse> {
  const userIdHeader = req.headers['x-user-id'] as string | undefined;
  const userType = req.headers['x-user-type'] as string | undefined;

  if (!userIdHeader || !userType) {
    throw new InternalServerErrorException('Internal Server Erro');
  }

  const { userId } = req.params;

  if (userType !== UserType.admin && userIdHeader !== userId) {
    throw new ForbiddenException('You can only view your own requests');
  }

  try {
    const ownerRequests = await ownerRequestRepository.getByUserId(userId);
    return {
      ownerRequests: ownerRequests,
    };
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
}

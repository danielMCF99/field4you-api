import { Request } from 'express';
import { ownerRequestRepository, userRepository } from '../../../app';
import {
  AllOwnerRequestsResponse,
  AllOwnerRequestsSummary,
} from '../../../domain/dto/all-ownerRequest.dto';
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
    const response: AllOwnerRequestsSummary[] = await Promise.all(
      ownerRequests.map(async (elem) => {
        const user = await userRepository.getById(elem.userId);

        if (!user) {
          console.warn(`User not found for request ${elem.getId()}`);
        }

        return {
          id: elem.getId(),
          userId: elem.userId,
          userEmail: user?.email ?? '',
          userPicture: user?.imageURL ?? undefined,
          status: elem.status,
          requestNumber: elem.requestNumber,
          createdAt: elem.createdAt,
          reviewedAt: elem.reviewedAt,
        };
      })
    );

    return {
      ownerRequests: response,
    };
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
}

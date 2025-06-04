import { ClientSession, Types } from 'mongoose';
import { OwnerRequestFilterParams } from '../../domain/dto/ownerRequest-filter.dto';
import { OwnerRequest } from '../../domain/entities/OwnerRequest';
import { IOwnerRequestRepository } from '../../domain/interfaces/OwnerRequestRepository';
import { OwnerRequestModel } from '../database/models/owner-request.model';

export class MongoOwnerRequestRepository implements IOwnerRequestRepository {
  private static instance: MongoOwnerRequestRepository;
  private constructor() {}

  // Static method to get the single instance
  public static getInstance(): MongoOwnerRequestRepository {
    if (!MongoOwnerRequestRepository.instance) {
      MongoOwnerRequestRepository.instance = new MongoOwnerRequestRepository();
    }
    return MongoOwnerRequestRepository.instance;
  }

  async create(ownerRequest: OwnerRequest): Promise<OwnerRequest> {
    const newOwnerRequest = new OwnerRequestModel({
      userId: new Types.ObjectId(ownerRequest.userId),
      message: ownerRequest.message,
      status: ownerRequest.status,
      createdAt: ownerRequest.createdAt,
      updatedAt: ownerRequest.updatedAt,
      reviewedAt: ownerRequest.reviewedAt,
      reviewedBy: ownerRequest.reviewedBy,
    });

    await newOwnerRequest.save();
    return OwnerRequest.fromMongooseDocument(newOwnerRequest);
  }

  async getAll(
    params: OwnerRequestFilterParams
  ): Promise<{ totalPages: number; ownerRequests: OwnerRequest[] }> {
    const {
      status,
      requestNumber,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = params;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (requestNumber) {
      query.requestNumber = {
        $regex: requestNumber,
      };
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const ownerRequests = await OwnerRequestModel.find(query)
      .sort({ [sortBy]: sortOrder, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const numberOfUsers = await OwnerRequestModel.countDocuments(query);

    return {
      totalPages: Math.ceil(numberOfUsers / limit),
      ownerRequests: ownerRequests.map(OwnerRequest.fromMongooseDocument),
    };
  }

  async get(id: string): Promise<OwnerRequest> {
    const ownerRequest = await OwnerRequestModel.findById(id).exec();
    return OwnerRequest.fromMongooseDocument(ownerRequest);
  }

  async getByUserId(userId: string): Promise<OwnerRequest[]> {
    const ownerRequests = await OwnerRequestModel.find({ userId }).exec();
    return ownerRequests.map(OwnerRequest.fromMongooseDocument);
  }

  async update(id: string, ownerRequest: OwnerRequest): Promise<OwnerRequest> {
    const updatedOwnerRequest = await OwnerRequestModel.findByIdAndUpdate(
      id,
      ownerRequest,
      { new: true }
    ).exec();
    return OwnerRequest.fromMongooseDocument(updatedOwnerRequest);
  }

  async updateStatus(
    id: string,
    status: string,
    reviewedBy: string,
    response?: string,
    session?: ClientSession
  ): Promise<OwnerRequest> {
    const updatedOwnerRequest = await OwnerRequestModel.findByIdAndUpdate(
      id,
      {
        status,
        response,
        reviewedBy,
        reviewedAt: new Date(),
      },
      { new: true, session }
    ).exec();

    return OwnerRequest.fromMongooseDocument(updatedOwnerRequest);
  }

  async delete(id: string): Promise<void> {
    await OwnerRequestModel.findByIdAndDelete(id).exec();
  }
}

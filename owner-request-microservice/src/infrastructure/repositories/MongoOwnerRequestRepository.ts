import { OwnerRequest } from "../../domain/entities/OwnerRequest";
import { IOwnerRequestRepository } from "../../domain/interfaces/OwnerRequestRepository";
import { OwnerRequestModel } from "../database/models/owner-request.model";

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
    const newOwnerRequest = await OwnerRequestModel.create(ownerRequest);
    return OwnerRequest.fromMongooseDocument(newOwnerRequest);
  }

  async getAll(): Promise<OwnerRequest[]> {
    const ownerRequests = await OwnerRequestModel.find().exec();
    return ownerRequests.map(OwnerRequest.fromMongooseDocument);
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

  async delete(id: string): Promise<void> {
    await OwnerRequestModel.findByIdAndDelete(id).exec();
  }

  async approve(id: string): Promise<OwnerRequest> {
    const ownerRequest = await OwnerRequestModel.findById(id).exec();
    if (!ownerRequest) {
      throw new Error(`OwnerRequest with id ${id} not found`);
    }
    ownerRequest.status = "approved";
    await ownerRequest.save();
    return OwnerRequest.fromMongooseDocument(ownerRequest);
  }

  async reject(id: string): Promise<OwnerRequest> {
    const ownerRequest = await OwnerRequestModel.findById(id).exec();
    if (!ownerRequest) {
      throw new Error(`OwnerRequest with id ${id} not found`);
    }
    ownerRequest.status = "rejected";
    await ownerRequest.save();
    return OwnerRequest.fromMongooseDocument(ownerRequest);
  }
}

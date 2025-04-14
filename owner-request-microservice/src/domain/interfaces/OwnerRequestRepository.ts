import { OwnerRequest } from "../entities/OwnerRequest";

export interface IOwnerRequestRepository {
  create(ownerRequest: OwnerRequest): Promise<OwnerRequest>;
  getAll(): Promise<OwnerRequest[]>;
  get(id: string): Promise<OwnerRequest>;
  getByUserId(userId: string): Promise<OwnerRequest[]>;
  update(id: string, ownerRequest: OwnerRequest): Promise<OwnerRequest>;
  delete(id: string): Promise<void>;
  approve(id: string): Promise<OwnerRequest>;
  reject(id: string): Promise<OwnerRequest>;
}

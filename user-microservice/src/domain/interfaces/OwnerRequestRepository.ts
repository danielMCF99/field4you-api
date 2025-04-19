import { OwnerRequestFilterParams } from '../dto/ownerRequest-filter.dto';
import { OwnerRequest } from '../entities/OwnerRequest';

export interface IOwnerRequestRepository {
  create(ownerRequest: OwnerRequest): Promise<OwnerRequest>;
  getAll(params: OwnerRequestFilterParams): Promise<OwnerRequest[]>;
  get(id: string): Promise<OwnerRequest>;
  getByUserId(userId: string): Promise<OwnerRequest[]>;
  update(id: string, ownerRequest: OwnerRequest): Promise<OwnerRequest>;
  delete(id: string): Promise<void>;
}

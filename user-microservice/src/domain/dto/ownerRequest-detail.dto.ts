import { OwnerRequest } from '../entities/OwnerRequest';
import { Location } from '../entities/User';

export interface OwnerRequestDetailResponse {
  ownerRequest: OwnerRequest;
  userDetails: {
    name: string;
    profilePicture: string | undefined;
    email: string;
    phoneNumber: string | undefined;
    birthDate: string;
    location: Location;
  };
}

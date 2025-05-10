import { LoginHistory } from '../entities/LoginHistory';

export interface ILoginHistoryRepository {
  create(loginHistory: LoginHistory): Promise<LoginHistory>;
}

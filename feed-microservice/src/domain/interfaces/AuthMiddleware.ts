export interface AuthMiddleware {
  authenticate(creatorId: string, token: string): Promise<boolean>;
  validateTokenExpirationDate(expiration: number): Promise<boolean>;
}

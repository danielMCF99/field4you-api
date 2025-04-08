export interface AuthMiddleware {
  authenticate(userId: string, email: string, token: string): Promise<boolean>;
}

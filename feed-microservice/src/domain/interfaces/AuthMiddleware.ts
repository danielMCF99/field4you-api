export interface AuthMiddleware {
  authenticate(
    creatorId: string,
    token: string
  ): Promise<{ authenticated: boolean }>;
}

export interface AuthMiddleware {
  authenticate(id: string, token: string): Promise<{ authenticated: boolean }>;
}

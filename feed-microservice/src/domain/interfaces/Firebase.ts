import { Request } from 'express';

export interface Firebase {
  uploadFileToFirebase(req: Request): Promise<string | undefined>;
}

import { Request } from 'express';

export interface Firebase {
  uploadFileToFirebase(req: Request): Promise<{ imageURL: string; fileName: string } | undefined>;
}

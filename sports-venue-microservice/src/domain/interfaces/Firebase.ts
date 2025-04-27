import { Request } from 'express';

export interface Firebase {
  uploadFilesToFirebase(req: Request): Promise<{ imageURL: string; fileName: string }[] | undefined>;
}

import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid'; // Para gerar nomes únicos
import { Firebase } from '../../domain/interfaces/Firebase';
import { bucket } from '../../app';

export class FirebaseImplementation implements Firebase {
  private static instance: FirebaseImplementation;

  private constructor() {}

  public static getInstance(): FirebaseImplementation {
    if (!FirebaseImplementation.instance) {
      FirebaseImplementation.instance = new FirebaseImplementation();
    }

    return FirebaseImplementation.instance;
  }

  async uploadFileToFirebase(req: Request): Promise<{ imageURL: string, fileName: string } | undefined> {
    if (!req.file) {
      return undefined;
    }

    try {
      const { originalname, buffer } = req.file;
      const fileName = `${uuidv4()}-${originalname}`;
      const file = bucket.file(fileName);

      await file.save(buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
        public: true,
      });

      // Image URL
      const imageURL = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return { imageURL, fileName };
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

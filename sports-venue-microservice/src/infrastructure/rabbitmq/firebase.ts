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

  async uploadFilesToFirebase(
    req: Request
  ): Promise<{ imageURL: string; fileName: string }[] | undefined> {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) return undefined;

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const filebaseFile = bucket.file(fileName);

        await filebaseFile.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
          },
          public: true,
        });

        // Image URL
        const imageURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        return { imageURL, fileName };
      })
    );
    console.log(uploadResults);
    return uploadResults;
  }
}

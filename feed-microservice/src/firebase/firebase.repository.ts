import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseRepository {
  #db: Firestore;
  #collection: FirebaseFirestore.CollectionReference;
  #bucket: Bucket;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
    this.#collection = this.#db.collection('posts');
    this.#bucket = firebaseApp.storage().bucket();
  }

  async uploadImageToStorageOnly(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; fileName: string }> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = this.#bucket.file(fileName);
    const uuid = uuidv4();

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => reject(err));

      stream.on('finish', () => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${this.#bucket.name}/o/${encodeURIComponent(
          fileName,
        )}?alt=media&token=${uuid}`;

        resolve({ imageUrl, fileName });
      });

      stream.end(file.buffer);
    });
  }

  async deletePost(fileName: string): Promise<void> {
    // Apagar imagem no Storage
    await this.#bucket
      .file(fileName)
      .delete()
      .catch(() => {
        console.warn(`Não foi possível apagar a imagem: ${fileName}`);
      });

    // await this.#collection.doc(postId).delete();
  }

  async listPostsPaginated(
    limit = 10,
    startAfter?: string,
    filters?: {
      creatorEmail?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    let query: FirebaseFirestore.Query = this.#collection;

    if (filters?.creatorEmail) {
      query = query.where('creatorEmail', '==', filters.creatorEmail);
    }

    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      query = query
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    if (startAfter) {
      const lastDocSnapshot = await this.#collection.doc(startAfter).get();

      if (lastDocSnapshot.exists) {
        query = query.startAfter(lastDocSnapshot);
      }
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    return {
      posts,
      lastId: posts.length ? posts[posts.length - 1].id : null,
    };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseRepository } from './firebase.repository';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseServiceAccount = configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT',
    );

    if (!firebaseServiceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined in .env');
    }
    let jsonString = Buffer.from(firebaseServiceAccount, 'base64').toString(
      'utf8',
    );

    const firebaseConfig = JSON.parse(jsonString);

    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      storageBucket: 'gs://plat-centro-neurosensorial.appspot.com',
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseRepository],
  exports: [FirebaseRepository],
})
export class FirebaseModule {}

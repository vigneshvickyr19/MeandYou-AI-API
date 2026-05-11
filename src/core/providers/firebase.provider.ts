import * as admin from 'firebase-admin';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';

class FirebaseProvider {
  private static instance: admin.app.App | null = null;

  public static getInstance(): admin.app.App {
    if (!this.instance) {
      try {
        if (admin.apps.length === 0) {
          this.instance = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: config.firebase.projectId,
              clientEmail: config.firebase.clientEmail,
              privateKey: config.firebase.privateKey,
            }),
          });
          logger.info('Firebase Admin initialized successfully');
        } else {
          this.instance = admin.app();
        }
      } catch (error) {
        logger.error('Failed to initialize Firebase Admin', error);
        throw error;
      }
    }
    return this.instance;
  }

  public static getFirestore(): admin.firestore.Firestore {
    return this.getInstance().firestore();
  }
}

export const firestore = FirebaseProvider.getFirestore();

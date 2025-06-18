import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import config from '../../../config/env';

function getServiceAccountFromEnv() {
  const base64 = config.googleAppCred;
  if (!base64) throw new Error('Service account base64 not set in .env');
  const jsonString = Buffer.from(base64, 'base64').toString('utf8');
  return JSON.parse(jsonString);
}

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

/**
 * Get Google OAuth access token for FCM API v1
 */
async function getAccessToken() {
  const serviceAccount = getServiceAccountFromEnv();

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

/**
 * Example of sending a message to FCM
 */
export async function sendFcmMessage(
  deviceToken: string,
  title: string,
  body: string
) {
  const token = await getAccessToken();

  const url = `https://fcm.googleapis.com/v1/projects/${config.googleProjectId}/messages:send`;

  const messageBody = {
    message: {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
    },
  };

  const response = await axios.post(url, messageBody, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(response.data);
}

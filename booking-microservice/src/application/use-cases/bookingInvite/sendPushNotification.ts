import axios from 'axios';
import config from '../../../config/env';

export async function sendPushNotification(
  token: string,
  title: string,
  body: string
) {
  const message = {
    to: token, // o pushNotificationToken que tens guardado na tua BD
    notification: {
      title: title,
      body: body,
    },
    // podes adicionar 'data' se quiseres payload extra não visível ao user
  };

  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      message,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${config.firebaseServerKey}`,
        },
      }
    );

    console.log('Push notification sent:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Error sending push notification:',
      error.response?.data || error.message
    );
    throw error;
  }
}

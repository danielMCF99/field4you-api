import amqp from 'amqplib';
import config from '../../config/env';

const USER_SERVICE_QUEUE = 'user_serv_user_registration_queue';
const BOOKING_SERVICE_QUEUE = 'booking_serv_user_registration_queue';

const queueList = [USER_SERVICE_QUEUE, BOOKING_SERVICE_QUEUE];

export async function publishUserCreation(userPayload: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  birthDate: string;
  registerDate: string;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    queueList.forEach((queue) => {
      // Ensure queue is durable
      channel.assertQueue(queue, { durable: true });

      const message = JSON.stringify(userPayload);
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log(
        `[x] Sent user registration event: ${message} for Queue: ${queue}s`
      );
    });
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

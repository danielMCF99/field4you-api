import amqp from 'amqplib';
import config from '../../config/env';

const AUTH_SERVICE_DELETE_QUEUE = 'auth_serv_user_deletion_queue';
const BOOKING_SERVICE_DELETE_QUEUE = 'booking_serv_user_deletion_queue';

const queueList = [AUTH_SERVICE_DELETE_QUEUE, BOOKING_SERVICE_DELETE_QUEUE];

export async function publishUserDeletion(userPayload: { userId: string }) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    queueList.forEach((queue) => {
      // Ensure queue is durable
      channel.assertQueue(queue, { durable: true });

      const message = JSON.stringify(userPayload);
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log(
        `[x] Sent User delete event: ${message} for Queue: ${queue}s`
      );
    });
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

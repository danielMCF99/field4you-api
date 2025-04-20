import amqp from 'amqplib';
import config from '../../config/env';
import { User } from '../../domain/entities/User';

const AUTH_SERVICE_DELETE_QUEUE = 'auth_serv_user_deletion_queue';
const BOOKING_SERVICE_DELETE_QUEUE = 'booking_serv_user_deletion_queue';

const deleteQueueList = [
  AUTH_SERVICE_DELETE_QUEUE,
  BOOKING_SERVICE_DELETE_QUEUE,
];

export async function publishUserDeletion(userPayload: { userId: string }) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    deleteQueueList.forEach((queue) => {
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

const AUTH_SERVICE_UPDATE_QUEUE = 'auth_serv_user_update_queue';
const BOOKING_SERVICE_UPDATE_QUEUE = 'booking_serv_user_update_queue';

const updateQueueList = [
  AUTH_SERVICE_UPDATE_QUEUE,
  BOOKING_SERVICE_UPDATE_QUEUE,
];

export async function publishUserUpdate(updatePayload: {
  userId: string;
  updatedData: Partial<User>;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    updateQueueList.forEach((queue) => {
      // Ensure queue is durable
      channel.assertQueue(queue, { durable: true });

      const message = JSON.stringify(updatePayload);
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log(
        `[x] Sent User update event: ${message} for Queue: ${queue}s`
      );
    });
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

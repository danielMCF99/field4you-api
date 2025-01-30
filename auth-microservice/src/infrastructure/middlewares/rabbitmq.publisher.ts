import amqp from 'amqplib';
import config from '../../config/env';

const QUEUE = 'user_registration_queue';

export async function publishUserCreation(userPayload: {
  authServiceUserId: string;
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

    // Ensure queue is durable
    await channel.assertQueue(QUEUE, { durable: true });

    const message = JSON.stringify(userPayload);
    channel.sendToQueue(QUEUE, Buffer.from(message), { persistent: true });
    console.log(` [x] Sent user registration event: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

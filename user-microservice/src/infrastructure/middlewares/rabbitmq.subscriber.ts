import amqp from 'amqplib';
import config from '../../config/env';
import { createUser } from '../../application/use-cases/createUser';

const QUEUE = 'user_registration_queue';

export async function subscribeUserCreation() {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    // Ensure queue is durable
    await channel.assertQueue(QUEUE, { durable: true });

    console.log(` [*] Waiting for user registration events...`);

    channel.consume(
      QUEUE,
      async (msg) => {
        if (msg?.content) {
          const user = JSON.parse(msg.content.toString());
          console.log(` [x] Received user registration event:`, user);

          await createUser(user);

          // Acknowledge message after processing
          channel.ack(msg);
        }
      },
      { noAck: false } // Ensure message is acknowledged only after processing
    );
  } catch (error) {
    console.error('Error subscribing to queue:', error);
  }
}

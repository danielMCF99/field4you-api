import amqp, { Connection } from 'amqplib';
import { deleteUser } from '../../application/use-cases/deleteUser';
import config from '../../config/env';

async function connectWithRetry(
  retries: number = 5,
  delay: number = 5000
): Promise<Connection> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(
        `Attempting to connect to RabbitMQ (Attempt ${i + 1}/${retries})...`
      );
      const connection = await amqp.connect(config.rabbitmqURL);
      console.log('Connected to RabbitMQ');
      return connection;
    } catch (error) {
      console.error(`RabbitMQ connection failed: ${(error as Error).message}`);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw new Error('RabbitMQ is unreachable after multiple attempts.');
      }
    }
  }
  throw new Error('Exhausted retries for RabbitMQ connection.');
}

export async function subscribeUserDeletion() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertExchange('user.events', 'topic', { durable: true });

    const queue = 'auth_user_events';
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, 'user.events', 'user.deleted');

    console.log(`[*] Waiting for User delete events...`);
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log('[x] Received User delete event:', payload);

        await deleteUser(payload.userId);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

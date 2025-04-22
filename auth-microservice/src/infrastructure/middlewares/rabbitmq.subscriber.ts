import amqp, { Connection } from 'amqplib';
import { deleteUser } from '../../application/use-cases/deleteUser';
import config from '../../config/env';
import { updateUser } from '../../application/use-cases/updateUser';

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
    await channel.bindQueue(queue, 'user.events', 'user.status.updated');

    console.log(`[*] Waiting for User delete events...`);
    channel.consume(queue, async (msg) => {
      if (!msg?.content) return;

      const routingKey = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());

      switch (routingKey) {
        case 'user.status.updated':
          console.log('Received User status updated:', data);
          await updateUser(data.userId, data.updatedData);
          break;
        case 'user.deleted':
          console.log('Received User deleted:', data);
          await deleteUser(data.userId);
          break;
        default:
          console.warn(`Unknown routing key: ${routingKey}`);
      }

      channel.ack(msg);
    });
  } catch (error) {
    console.log(error);
  }
}

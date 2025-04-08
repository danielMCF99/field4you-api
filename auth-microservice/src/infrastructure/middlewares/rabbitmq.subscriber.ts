import amqp, { Connection } from 'amqplib';
import config from '../../config/env';
import { deleteUser } from '../../application/use-cases/deleteUser';

const AUTH_SERVICE_DELETE_QUEUE = 'auth_serv_user_deletion_queue';

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

    // Ensure queue is durable
    await channel.assertQueue(AUTH_SERVICE_DELETE_QUEUE, { durable: true });

    console.log(`[*] Waiting for User delete events...`);

    channel.consume(
      AUTH_SERVICE_DELETE_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const user = JSON.parse(msg.content.toString());
          console.log(`[x] Received User delete event:`, user);

          await deleteUser(user.userId);

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

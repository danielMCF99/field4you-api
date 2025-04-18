import amqp, { Connection } from 'amqplib';
import { createUser } from '../../application/use-cases/users/createUser';
import config from '../../config/env';

const USER_CREATION_QUEUE = 'user_serv_user_registration_queue';

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

export async function subscribeUserCreation() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    // Ensure queue is durable
    await channel.assertQueue(USER_CREATION_QUEUE, { durable: true });

    console.log(`[*] Waiting for User registration events...`);

    channel.consume(
      USER_CREATION_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const user = JSON.parse(msg.content.toString());
          console.log(`[x] Received User registration event:`, user);

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

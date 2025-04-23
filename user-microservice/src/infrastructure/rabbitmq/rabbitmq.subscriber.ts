import amqp, { Connection } from 'amqplib';
import { createUser } from '../../application/use-cases/users/createUser';
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

export async function subscribeUserCreation() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertExchange('user.events', 'topic', { durable: true });

    const queue = await channel.assertQueue('user_user_events', {
      durable: true,
    });
    await channel.bindQueue(queue.queue, 'user.events', 'user.created');

    console.log(`[*] Waiting for User registration events...`);
    channel.consume(queue.queue, async (msg) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log('[x] Received User registration event:');

          await createUser(payload);
          channel.ack(msg);
        } catch (error) {
          console.error(
            `Error processing message with routing key user.created:`,
            error
          );
          channel.nack(msg, false, true); // A mensagem pode ser reencaminhada para tentar novamente ou registrada para análise posterior
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

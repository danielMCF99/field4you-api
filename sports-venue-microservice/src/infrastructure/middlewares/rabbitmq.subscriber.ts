import amqp from 'amqplib';
import { sportsVenueRepository } from '../../app';
import config from '../../config/env';

async function connectWithRetry(
  retries: number = 5,
  delay: number = 30000
): Promise<any> {
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

/**
 *
 * User related queues
 *
 */
export async function subscribeUserEvents() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertExchange('user.events', 'topic', {
      durable: true,
    });

    const queue = await channel.assertQueue('sports_venue_user_events', {
      durable: true,
    });

    await channel.bindQueue(queue.queue, 'user.events', 'user.deleted');
    await channel.bindQueue(queue.queue, 'user.events', 'user.status.updated');

    console.log(`[*] Waiting for User events...`);
    channel.consume(queue.queue, async (msg: any) => {
      if (!msg?.content) return;

      const routingKey = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());

      switch (routingKey) {
        case 'user.deleted':
          console.log('Received User deleted:', data);
          const deletedCount = await sportsVenueRepository.deleteManyByOwnerId(
            data.userId
          );
          if (deletedCount === 0) {
            console.log('User with given ID had no sports venues to delete');
          }
          break;

        case 'user.status.updated':
          console.log('Received User updated:', data);

          const updatedCount =
            await sportsVenueRepository.findByOwnerIdAndUpdate(
              data.userId,
              data.updatedData
            );

          if (updatedCount === 0) {
            console.log('User with given ID had no sports venues to update');
          }

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

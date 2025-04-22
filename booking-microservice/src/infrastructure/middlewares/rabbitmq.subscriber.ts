import amqp, { Connection } from 'amqplib';
import { createSportsVenue } from '../../application/use-cases/sportsVenue/createSportsVenue';
import { deleteSportsVenue } from '../../application/use-cases/sportsVenue/deleteSportsVenue';
import { updateSportsVenue } from '../../application/use-cases/sportsVenue/updateSportsVenue';
import { createUser } from '../../application/use-cases/user/createUser';
import { deleteUser } from '../../application/use-cases/user/deleteUser';
import config from '../../config/env';
import { updateUser } from '../../application/use-cases/user/updateUser';

async function connectWithRetry(
  retries: number = 5,
  delay: number = 30000
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

    const queue = await channel.assertQueue('booking_user_events', {
      durable: true,
    });

    await channel.bindQueue(queue.queue, 'user.events', 'user.created');
    await channel.bindQueue(queue.queue, 'user.events', 'user.updated');
    await channel.bindQueue(queue.queue, 'user.events', 'user.status.updated');
    await channel.bindQueue(queue.queue, 'user.events', 'user.deleted');

    console.log(`[*] Waiting for User events...`);
    channel.consume(queue.queue, async (msg) => {
      if (!msg?.content) return;

      const routingKey = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());

      switch (routingKey) {
        case 'user.created':
          console.log('Received User created:', data);
          await createUser(data);
          break;
        case 'user.updated':
          console.log('Received User updated:', data);
          await updateUser(data.userId, data.updatedData);
          break;
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

/**
 *
 * Sports Venue related queues
 *
 */
export async function subscribeSportsVenueEvents() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertExchange('sportsvenue.events', 'topic', {
      durable: true,
    });

    const queue = await channel.assertQueue('booking_sportsvenue_events', {
      durable: true,
    });

    await channel.bindQueue(
      queue.queue,
      'sportsvenue.events',
      'sportsvenue.created'
    );
    await channel.bindQueue(
      queue.queue,
      'sportsvenue.events',
      'sportsvenue.deleted'
    );
    await channel.bindQueue(
      queue.queue,
      'sportsvenue.events',
      'sportsvenue.updated'
    );

    console.log(`[*] Waiting for Sport Venue events...`);
    channel.consume(queue.queue, async (msg) => {
      if (!msg?.content) return;

      const routingKey = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());

      switch (routingKey) {
        case 'sportsvenue.created':
          console.log('Received Sport Venue created:', data);
          await createSportsVenue(data);
          break;
        case 'sportsvenue.updated':
          console.log('Received Sport Venue updated:', data);
          await updateSportsVenue(data.sportsVenueId, data);
          break;
        case 'sportsvenue.deleted':
          console.log('Received Sport Venue deleted:', data);
          await deleteSportsVenue(data.sportsVenueId);
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

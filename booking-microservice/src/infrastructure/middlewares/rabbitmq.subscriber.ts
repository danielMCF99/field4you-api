import amqp, { Connection } from 'amqplib';
import { createSportsVenue } from '../../application/use-cases/sportsVenue/createSportsVenue';
import { deleteSportsVenue } from '../../application/use-cases/sportsVenue/deleteSportsVenue';
import { updateSportsVenue } from '../../application/use-cases/sportsVenue/updateSportsVenue';
import { createUser } from '../../application/use-cases/user/createUser';
import { deleteUser } from '../../application/use-cases/user/deleteUser';
import config from '../../config/env';

async function connectWithRetry(
  retries: number = 5,
  delay: number = 50000
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

export async function subscribeUserUpdate() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    // Ensure queue is durable
    await channel.assertQueue(USER_UPDATE_QUEUE, { durable: true });

    console.log(`[*] Waiting for User update events...`);

    channel.consume(
      USER_UPDATE_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const user = JSON.parse(msg.content.toString());
          console.log(`[x] Received User update event:`, user);

          await updateUser(user.userId, user.updatedData);

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
/**
 *
 * Sports Venue related queues
 *
 */
export async function subscribeSportsVenueEvents() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    // Ensure queue is durable
    await channel.assertQueue(SPORTS_VENUE_CREATION_QUEUE, { durable: true });

    console.log(`[*] Waiting for Sport Venue registration events...`);

    channel.consume(
      SPORTS_VENUE_CREATION_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const sportsVenue = JSON.parse(msg.content.toString());
          console.log(
            `[x] Received Sport Venue registration event:`,
            sportsVenue
          );

          await createSportsVenue(sportsVenue);

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

export async function subscribeSportsVenueDeletion() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertQueue(SPORTS_VENUE_DELETION_QUEUE, { durable: true });

    console.log(`[*] Waiting for Sport Venue deletion events...`);

    channel.consume(
      SPORTS_VENUE_DELETION_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const sportsVenue = JSON.parse(msg.content.toString());
          console.log(`[x] Received Sport Venue deletion event:`, sportsVenue);

          await deleteSportsVenue(sportsVenue.sportsVenueId);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error subscribing to deletion queue:', error);
  }
}

export async function subscribeSportsVenueUpdates() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertQueue(SPORTS_VENUE_UPDATE_QUEUE, { durable: true });
    console.log('[*] Waiting for Sports Venue update events...');

    channel.consume(
      SPORTS_VENUE_UPDATE_QUEUE,
      async (msg) => {
        if (msg?.content) {
          const updatedSportsVenue = JSON.parse(msg.content.toString());
          console.log(
            '[x] Received Sports Venue update event:',
            updatedSportsVenue
          );

          await updateSportsVenue(
            updatedSportsVenue.sportsVenueId,
            updatedSportsVenue
          );
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error subscribing to update queue:', error);
  }
}

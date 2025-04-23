import amqp from 'amqplib';
import config from '../../config/env';
import { SportsVenue } from '../../domain/entities/sports-venue';

const EXCHANGE_NAME = 'sportsvenue.events';
const EXCHANGE_TYPE = 'topic';

async function publishToExchange(routingKey: string, payload: any) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    const message = JSON.stringify(payload);
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message), {
      persistent: true,
    });

    console.log(`[x] Sent ${routingKey} event: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error(`Error publishing ${routingKey} message:`, error);
  }
}

export async function publishSportsVenueCreation(sportsVenuePayload: {
  sportsVenueId: string;
  ownerId: string;
  sportsVenueType: string;
  status: string;
  sportsVenueName: string;
  bookingMinDuration: number;
  bookingMinPrice: number;
}) {
  await publishToExchange('sportsvenue.created', sportsVenuePayload);
}

export async function publishSportsVenueDeletion(sportsVenuePayload: {
  sportsVenueId: string;
  ownerId: string;
}) {
  await publishToExchange('sportsvenue.deleted', sportsVenuePayload);
}

export async function publishSportsVenueUpdate(updatePayload: {
  sportsVenueId: string;
  ownerId: string;
  updatedData: Partial<SportsVenue>;
}) {
  await publishToExchange('sportsvenue.updated', updatePayload);
}

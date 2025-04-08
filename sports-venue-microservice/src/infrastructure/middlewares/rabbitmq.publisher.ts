import amqp from 'amqplib';
import config from '../../config/env';
import { SportsVenue } from '../../domain/entities/sports-venue';

const BOOKING_SERVICE_QUEUE = 'booking_serv_sports_venue_creation_queue';
const BOOKING_SERVICE_QUEUE_DELETION =
  'booking_serv_sports_venue_deletion_queue';
const BOOKING_SERVICE_QUEUE_UPDATE = 'booking_serv_sports_venue_update_queue';

export async function publishSportsVenueCreation(sportsVenuePayload: {
  sportsVenueId: string;
  ownerId: string;
  location: string;
  sportsVenueType: string;
  status: string;
  sportsVenueName: string;
  bookingMinDuration: number;
  bookingMinPrice: number;
  sportsVenuePicture: string;
  hasParking: boolean;
  hasShower: boolean;
  hasBar: boolean;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    channel.assertQueue(BOOKING_SERVICE_QUEUE, { durable: true });

    const message = JSON.stringify(sportsVenuePayload);
    channel.sendToQueue(BOOKING_SERVICE_QUEUE, Buffer.from(message), {
      persistent: true,
    });
    console.log(`[x] Sent Sports Venue creation event: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing creation message:', error);
  }
}

export async function publishSportsVenueDeletion(sportsVenuePayload: {
  sportsVenueId: string;
  ownerId: string;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    channel.assertQueue(BOOKING_SERVICE_QUEUE_DELETION, { durable: true });

    const message = JSON.stringify(sportsVenuePayload);
    channel.sendToQueue(BOOKING_SERVICE_QUEUE_DELETION, Buffer.from(message), {
      persistent: true,
    });
    console.log(`[x] Sent Sports Venue deletion event: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing deletion message:', error);
  }
}

export async function publishSportsVenueUpdate(updatePayload: {
  sportsVenueId: string;
  ownerId: string;
  updatedData: Partial<SportsVenue>;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    await channel.assertQueue(BOOKING_SERVICE_QUEUE_UPDATE, { durable: true });

    const message = JSON.stringify(updatePayload);
    channel.sendToQueue(BOOKING_SERVICE_QUEUE_UPDATE, Buffer.from(message), {
      persistent: true,
    });
    console.log(`[x] Sent Sports Venue update event: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing update message:', error);
  }
}

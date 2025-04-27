import amqp from 'amqplib';
import config from '../../config/env';

const EXCHANGE_NAME = 'booking.events';
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

export async function publishFinishedBooking(finishedBookingPayload: {
  invitedUserIds: any[];
}) {
  await publishToExchange('booking.finished', finishedBookingPayload);
}

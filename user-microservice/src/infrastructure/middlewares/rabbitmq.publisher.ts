import amqp from 'amqplib';
import config from '../../config/env';
import { User } from '../../domain/entities/User';

const EXCHANGE_NAME = 'user.events';
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

export async function publishUserDeletion(userPayload: { userId: string }) {
  await publishToExchange('user.deleted', userPayload);
}

export async function publishUserUpdate(updatePayload: {
  userId: string;
  updatedData: Partial<User>;
}) {
  await publishToExchange('user.updated', updatePayload);
}

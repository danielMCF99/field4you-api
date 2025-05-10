import amqp from 'amqplib';
import config from '../../config/env';

const USER_EVENTS_EXCHANGE = 'user.events';
const USER_CREATED_ROUTING_KEY = 'user.created';

export async function publishUserCreation(userPayload: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  location: {
    address: string;
    city: string;
    district: string;
  };
  userType: string;
  birthDate: string;
}) {
  try {
    const connection = await amqp.connect(config.rabbitmqURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', {
      durable: true,
    });

    const message = JSON.stringify(userPayload);
    channel.publish(
      USER_EVENTS_EXCHANGE,
      USER_CREATED_ROUTING_KEY,
      Buffer.from(message),
      { persistent: true }
    );

    console.log(`[x] Sent user.created event to ${USER_EVENTS_EXCHANGE}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

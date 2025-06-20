import amqp, { Connection } from 'amqplib';
import { userRepository } from '../../app';
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

export async function subscribeUserEvents() {
  try {
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    await channel.assertExchange('user.events', 'topic', { durable: true });

    const queue = await channel.assertQueue('user_user_events', {
      durable: true,
    });

    // Bind to all relevant user events
    await channel.bindQueue(queue.queue, 'user.events', 'user.created');
    await channel.bindQueue(queue.queue, 'user.events', 'user.updated');
    await channel.bindQueue(queue.queue, 'user.events', 'user.status.updated');
    await channel.bindQueue(queue.queue, 'user.events', 'user.deleted');
    await channel.bindQueue(queue.queue, 'user.events', 'auth.user.updated');

    console.log(`[*] Waiting for User events...`);
    channel.consume(queue.queue, async (msg: any) => {
      if (!msg?.content) return;

      const routingKey = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());

      try {
        switch (routingKey) {
          case 'user.created':
            console.log('Received User created');
            await createUser(data);
            break;
          case 'user.updated':
            console.log('Received User updated');
            // Aqui assume-se que existe uma função updateUser semelhante ao createUser
            await userRepository.update(data.userId, data.updatedData);
            break;
          case 'auth.user.updated':
            console.log('Received User updated for push notification token');
            await userRepository.update(data.userId, {
              pushNotificationToken: data.pushNotificationToken,
            });
            break;
          case 'user.status.updated':
            console.log('Received User status updated');
            await userRepository.update(data.userId, { status: data.status });
            break;
          case 'user.deleted':
            console.log('Received User deleted');
            await userRepository.delete(data.userId);
            break;
          default:
            console.warn(`Unknown routing key: ${routingKey}`);
        }

        channel.ack(msg);
      } catch (error) {
        console.error(
          `Error processing message with routing key ${routingKey}:`,
          error
        );
        channel.nack(msg, false, true); // Pode reenfileirar a mensagem para tentar de novo
      }
    });
  } catch (error) {
    console.log(error);
  }
}

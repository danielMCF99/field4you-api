import amqp from "amqplib";
import config from "../../config/env";

const BOOKING_SERVICE_QUEUE = "booking_service_sports_venue_creation_queue";

const queueList = [BOOKING_SERVICE_QUEUE];

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

    queueList.forEach((queue) => {
      // Ensure queue is durable
      channel.assertQueue(queue, { durable: true });

      const message = JSON.stringify(sportsVenuePayload);
      channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      console.log(` [x] Sent Sports Venue registration event: ${message}`);

      setTimeout(() => {
        connection.close();
      }, 500);
    });
  } catch (error) {
    console.error("Error publishing message:", error);
  }
}

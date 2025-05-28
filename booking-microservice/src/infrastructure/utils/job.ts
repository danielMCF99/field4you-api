import cron from 'node-cron';
import { autoUpdateBookingsToDone } from './autoUpdateBookingsToDone';

export const startLoggingJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Entrei no Job');
    await autoUpdateBookingsToDone();
  });
};

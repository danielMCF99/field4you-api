import csv from 'csv-parser';
import { Readable } from 'stream';

export interface CSVUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
  district: string;
  city: string;
  address: string;
}

export const parseCSVUsers = (fileBuffer: Buffer): Promise<CSVUser[]> => {
  return new Promise((resolve, reject) => {
    const results: CSVUser[] = [];
    const stream = Readable.from(fileBuffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
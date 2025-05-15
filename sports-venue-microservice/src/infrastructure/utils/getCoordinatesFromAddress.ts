import axios, { AxiosError } from 'axios';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';

type NominatimResponse = Array<{
  lat: string;
  lon: string;
}>;

export const getCoordinatesFromAddress = async (
  address: string,
  city: string,
  district: string
): Promise<{ latitude: number; longitude: number }> => {
  const fullAddress = `${address}, ${city}, ${district}, Portugal`;

  try {
    const response = await axios.get<NominatimResponse>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: fullAddress,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
      }
    );

    if (response.data.length === 0) {
      throw new BadRequestException('Location Not Found');
    }

    return {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon),
    };
  } catch (error: unknown) {
    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof AxiosError) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new BadRequestException('Location Not Found');
        }
      }
    }

    throw new InternalServerErrorException('Error retrieving coordinates');
  }
};

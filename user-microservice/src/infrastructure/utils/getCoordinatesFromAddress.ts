import axios from 'axios';

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
    throw new Error('Coordinates not found for the given address');
  }

  return {
    latitude: parseFloat(response.data[0].lat),
    longitude: parseFloat(response.data[0].lon),
  };
};

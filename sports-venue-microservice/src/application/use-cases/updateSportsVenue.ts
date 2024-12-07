import { SportsVenue } from "../../domain/entities/sports-venue";
import { ISportsVenueRepository } from "../../domain/interfaces/SportsVenueRepository";
import { authMiddleware } from "../../app";

export const updateSportsVenue = async (
  id: string,
  token: string,
  updatedData: Partial<SportsVenue>,
  repository: ISportsVenueRepository
): Promise<{ status: number; message: string; sportsVenue?: SportsVenue }> => {
  try {
    // Buscar o campo desportivo pelo ID
    const sportsVenue = await repository.findById(id);

    // Verificar se o campo desportivo foi encontrado
    if (!sportsVenue) {
      return { status: 404, message: "Sports Venue not found" };
    }

    // Verificar se o ownerId está definido
    if (!sportsVenue.ownerId) {
      return { status: 404, message: "Owner not found" };
    }

    // Validar o token para o proprietário
    const authenticated = await authMiddleware.authenticate(
      sportsVenue.ownerId,
      token
    );

    if (!authenticated) {
      return { status: 401, message: "Authentication failed" };
    }

    // Atualizar o campo desportivo
    const updatedSportsVenue = await repository.update(sportsVenue.getId(), {
      ...sportsVenue, // Manter os dados existentes
      ...updatedData, // Sobrescrever com os dados atualizados
    });

    if (!updatedSportsVenue) {
      return { status: 404, message: "Failed to update Sports Venue" };
    }

    return {
      status: 200,
      message: "Sports Venue updated successfully",
      sportsVenue: updatedSportsVenue,
    };
  } catch (error) {
    console.error("Error updating sports venue:", error);
    return { status: 500, message: "Internal server error" };
  }
};
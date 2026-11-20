/**
 * Contrato de entrada para actualizar un conductor.
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class UpdateDriverDto {
  crewId?: string | null;
  endedAt?: string | null;
  isActive?: boolean;
}

/**
 * Contrato de entrada para actualizar un miembro de cuadrilla.
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class UpdateCrewMemberDto {
  fullName?: string;
  crewId?: string | null;
  isActive?: boolean;
}

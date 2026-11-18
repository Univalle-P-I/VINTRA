/**
 * Contrato de entrada para registrar un miembro de cuadrilla.
 * Sin validaciones por ahora: se agregan con la implementación funcional (VIN-024).
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class CreateCrewMemberDto {
  fullName!: string;
  crewId?: string;
}

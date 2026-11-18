/**
 * Contrato de entrada para registrar un conductor.
 * Sin validaciones por ahora: se agregan con la implementación funcional (VIN-024).
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class CreateDriverDto {
  userAccountId!: string;
  crewId?: string;
}

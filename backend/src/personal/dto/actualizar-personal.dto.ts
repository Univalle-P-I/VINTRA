/**
 * Contrato de entrada para actualizar personal operativo.
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class ActualizarPersonalDto {
  fullName?: string;
  role?: string;
  active?: boolean;
}

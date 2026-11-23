/**
 * Contrato de entrada para registrar la posición de un vehículo.
 * Sin validaciones por ahora: se agregan con la implementación funcional.
 * PROVISIONAL: campos sujetos al esquema de la PR #115.
 */
export class CreateVehiclePositionDto {
  assignmentId!: string;
  geom!: object;
  recordedAt!: string;
}
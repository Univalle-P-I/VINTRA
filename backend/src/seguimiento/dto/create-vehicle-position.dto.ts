/**
 * Contrato de entrada para registrar la posición de un vehículo.
 * Sin validaciones por ahora: se agregan con la implementación funcional.
 * Campos alineados con la migración 018 (PR #115); alcance sujeto a #91.
 */
export class CreateVehiclePositionDto {
  assignmentId!: string;
  geom!: object;
  recordedAt!: string;
}
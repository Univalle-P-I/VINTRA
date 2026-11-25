import { ApiProperty } from '@nestjs/swagger';

export class MicrorouteResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String })
  nombre: string;

  @ApiProperty({ type: String, maxLength: 30 })
  codigo: string;

  @ApiProperty({ type: Boolean })
  activo: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  actualizadoEn: string;

  @ApiProperty({ type: String, format: 'date-time' })
  creadoEn: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class NeighborhoodResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String })
  comuna: string;

  @ApiProperty({ type: String })
  nombre: string;

  @ApiProperty({ type: String, format: 'date-time' })
  creadoEn: string;
}

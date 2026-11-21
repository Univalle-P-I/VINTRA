import { ApiProperty } from '@nestjs/swagger';
import { NeighborhoodResponseDto } from '../../barrios/dto/neighborhood-response.dto';

export class MicrorouteNeighborhoodResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: NeighborhoodResponseDto })
  barrio: NeighborhoodResponseDto;

  @ApiProperty({ type: Number, format: 'int32', minimum: 1 })
  ordenVisita: number;
}

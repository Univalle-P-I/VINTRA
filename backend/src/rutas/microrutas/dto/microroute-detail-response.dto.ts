import { ApiProperty } from '@nestjs/swagger';
import { MacrorouteResponseDto } from '../../macrorutas/dto/macroroute-response.dto';
import { MicrorouteNeighborhoodResponseDto } from './microroute-neighborhood-response.dto';
import { MicrorouteResponseDto } from './microroute-response.dto';

export class MicrorouteDetailResponseDto extends MicrorouteResponseDto {
  @ApiProperty({ type: MacrorouteResponseDto })
  macroruta: MacrorouteResponseDto;

  @ApiProperty({ type: MicrorouteNeighborhoodResponseDto, isArray: true })
  barrios: MicrorouteNeighborhoodResponseDto[];
}

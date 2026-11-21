import { ApiProperty } from '@nestjs/swagger';
import { MacrorouteResponseDto } from '../../macrorutas/dto/macroroute-response.dto';
import { MicrorouteResponseDto } from './microroute-response.dto';

export class MicrorouteCreatedResponseDto extends MicrorouteResponseDto {
  @ApiProperty({ type: MacrorouteResponseDto })
  macroruta: MacrorouteResponseDto;
}

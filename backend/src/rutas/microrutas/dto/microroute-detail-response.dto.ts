import { ApiProperty } from '@nestjs/swagger';
import { MacrorouteResponseDto } from '../../macrorutas/dto/macroroute-response.dto';
import { MicrorouteNeighborhoodResponseDto } from './microroute-neighborhood-response.dto';
import { MicrorouteResponseDto } from './microroute-response.dto';

export class MicrorouteDetailResponseDto extends MicrorouteResponseDto {
  @ApiProperty({ type: MacrorouteResponseDto })
  macroruta: MacrorouteResponseDto;

  @ApiProperty({
    description: 'GeoJSON MultiLineString en SRID 4326.',
    example: {
      type: 'MultiLineString',
      coordinates: [
        [
          [-76.53, 3.43],
          [-76.52, 3.44],
        ],
      ],
    },
  })
  geom: unknown;

  @ApiProperty({ type: MicrorouteNeighborhoodResponseDto, isArray: true })
  barrios: MicrorouteNeighborhoodResponseDto[];
}

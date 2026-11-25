import { ApiProperty } from '@nestjs/swagger';
import { MacrorouteResponseDto } from './macroroute-response.dto';

export class MacrorouteDetailResponseDto extends MacrorouteResponseDto {
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
}

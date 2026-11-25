import { ApiProperty } from '@nestjs/swagger';

export function ApiMultiLineString(): PropertyDecorator {
  return ApiProperty({
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
  });
}

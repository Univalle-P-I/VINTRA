import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsMultiLineString } from '../../validators/is-multilinestring';

export class CrearMacrorutaDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo: string;

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
  @IsMultiLineString()
  geom: unknown;
}
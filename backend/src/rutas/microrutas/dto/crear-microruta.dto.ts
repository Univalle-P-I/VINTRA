import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiMultiLineString } from '../../decorators/api-multilinestring.decorator';
import { IsMultiLineString } from '../../validators/is-multilinestring';

export class CrearMicrorutaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  macrorutaId: string;

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

  @ApiMultiLineString()
  @IsMultiLineString()
  geom: unknown;
}
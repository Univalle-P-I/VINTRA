import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CrearMicrorutaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  macrorutaId: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
import { Transform } from 'class-transformer';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CrearIntegranteCuadrillaDto {
  @IsUUID()
  crewId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  fullName: string;
}

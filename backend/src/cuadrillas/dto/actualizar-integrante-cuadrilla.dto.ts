import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class ActualizarIntegranteCuadrillaDto {
  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** Contrato de entrada para registrar un miembro de cuadrilla (tabla `crew_member`). */
export class CreateCrewMemberDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsUUID()
  crewId?: string;
}

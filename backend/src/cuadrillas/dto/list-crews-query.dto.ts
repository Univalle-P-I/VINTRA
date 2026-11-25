import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

/** Filtros del listado de cuadrillas. Sin `isActive` solo se listan las activas. */
export class ListCrewsQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isActive?: boolean;
}

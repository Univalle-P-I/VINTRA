import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

/** Filtros del listado de conductores. Sin `isActive` solo se listan los activos. */
export class ListDriversQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  crewId?: string;
}

import { IsISO8601, IsUUID, Matches } from 'class-validator';

export class CrearAsignacionDto {
  /** Programación de microruta (`microroute_schedule`): microruta + franja + día. */
  @IsUUID()
  programacionId!: string;

  @IsUUID()
  conductorId!: string;

  @IsUUID()
  vehiculoId!: string;

  /** Fecha de ejecución `YYYY-MM-DD`; debe coincidir con el día de la programación. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener el formato YYYY-MM-DD',
  })
  @IsISO8601({ strict: true })
  fecha!: string;
}

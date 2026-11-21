import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Tabla `schedule` (franja horaria). Mapeo mínimo para #93. */
@Entity({ name: 'schedule' })
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** `TIME`: llega como "HH:MM:SS". */
  @Column({ name: 'start_time', type: 'time' })
  horaInicio!: string;

  @Column({ name: 'end_time', type: 'time' })
  horaFin!: string;

  @Column({ name: 'is_active', type: 'boolean' })
  activo!: boolean;
}

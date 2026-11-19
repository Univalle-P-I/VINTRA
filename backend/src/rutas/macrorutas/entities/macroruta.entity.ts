import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'macroroute' })
export class Macroruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'is_active', type: 'boolean' })
  activo: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  actualizadoEn: Date;

  @Column({ name: 'created_at', type: 'timestamptz' })
  creadoEn: Date;
}

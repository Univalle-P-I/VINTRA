import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'btura_neighborhood' })
export class Barrio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'commune', type: 'varchar', length: 100 })
  comuna: string;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  creadoEn: Date;
}

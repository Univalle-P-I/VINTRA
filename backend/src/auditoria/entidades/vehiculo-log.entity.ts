import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Vehiculo } from '../../vehiculos/entidades/vehiculo.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('vehicle_log')
export class VehiculoLog extends EntidadLogBase {
  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  vehiculo: Vehiculo;
}

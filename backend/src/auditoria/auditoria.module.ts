import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { IntegranteCuadrillaLog } from './entidades/integrante-cuadrilla-log.entity';
import { CuadrillaLog } from './entidades/cuadrilla-log.entity';
import { MacrorutaLog } from './entidades/macroruta-log.entity';
import { MicrorutaLog } from './entidades/microruta-log.entity';
import { VehiculoLog } from './entidades/vehiculo-log.entity';
import { DatosUsuarioLog } from './entidades/datos-usuario-log.entity';
import { CuentaUsuarioLog } from './entidades/cuenta-usuario-log.entity';
import { AsignacionLog } from './entidades/asignacion-log.entity';
import { ConductorLog } from './entidades/conductor-log.entity';
import { PerfilLog } from './entidades/perfil-log.entity';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

@Module({
  imports: [
    AutenticacionModule,
    TypeOrmModule.forFeature([
      IntegranteCuadrillaLog,
      CuadrillaLog,
      MacrorutaLog,
      MicrorutaLog,
      VehiculoLog,
      DatosUsuarioLog,
      CuentaUsuarioLog,
      AsignacionLog,
      ConductorLog,
      PerfilLog,
    ]),
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService, TypeOrmModule],
})
export class AuditoriaModule {}
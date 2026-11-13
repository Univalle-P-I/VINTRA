import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export enum RecursoAuditoria {
  CUENTAS = 'user-accounts',
  DATOS_USUARIO = 'user-data',
  PERFILES = 'profiles',
  CONDUCTORES = 'drivers',
  CUADRILLAS = 'crews',
  INTEGRANTES = 'crew-members',
  MACRORUTAS = 'macroroutes',
  MICRORUTAS = 'microroutes',
  VEHICULOS = 'vehicles',
  ASIGNACIONES = 'assignments',
}

interface RegistroAuditoria {
  id: string;
  entity_id: string;
  actor_id: string | null;
  action: string;
  request_ip: string | null;
  created_at: Date | string;
}

const tablasPorRecurso: Record<RecursoAuditoria, string> = {
  [RecursoAuditoria.CUENTAS]: 'user_account_log',
  [RecursoAuditoria.DATOS_USUARIO]: 'user_data_log',
  [RecursoAuditoria.PERFILES]: 'profile_log',
  [RecursoAuditoria.CONDUCTORES]: 'driver_log',
  [RecursoAuditoria.CUADRILLAS]: 'crew_log',
  [RecursoAuditoria.INTEGRANTES]: 'crew_member_log',
  [RecursoAuditoria.MACRORUTAS]: 'macroroute_log',
  [RecursoAuditoria.MICRORUTAS]: 'microroute_log',
  [RecursoAuditoria.VEHICULOS]: 'vehicle_log',
  [RecursoAuditoria.ASIGNACIONES]: 'assignment_log',
};

@Injectable()
export class AuditoriaService {
  constructor(private readonly dataSource: DataSource) {}

  async listar(recurso: RecursoAuditoria, page: number, limit: number) {
    const table = tablasPorRecurso[recurso];
    if (!table) {
      throw new BadRequestException('El recurso de auditoría no es válido.');
    }
    const offset = (page - 1) * limit;
    const [rows, countRows] = await Promise.all([
      this.dataSource.query<RegistroAuditoria[]>(
        `SELECT id, entity_id, actor_id, action, request_ip, created_at
         FROM ${table}
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.dataSource.query<Array<{ total: string }>>(
        `SELECT COUNT(*)::text AS total FROM ${table}`,
      ),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        entityId: row.entity_id,
        actorId: row.actor_id,
        action: row.action,
        requestIp: row.request_ip,
        createdAt: row.created_at,
      })),
      total: Number(countRows[0]?.total ?? 0),
      page,
      limit,
    };
  }
}

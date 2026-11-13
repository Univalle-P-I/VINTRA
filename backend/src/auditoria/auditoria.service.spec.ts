import { BadRequestException } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { AuditoriaService, RecursoAuditoria } from './auditoria.service';

describe('AuditoriaService', () => {
  it('queries only the allowlisted resource and omits old/new snapshots', async () => {
    const dataSource = {
      query: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'log-id',
            entity_id: 'entity-id',
            actor_id: 'actor-id',
            action: 'UPDATE',
            request_ip: '192.0.2.10',
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          },
        ])
        .mockResolvedValueOnce([{ total: '1' }]),
    };
    const service = new AuditoriaService(dataSource as unknown as DataSource);

    await expect(
      service.listar(RecursoAuditoria.ASIGNACIONES, 1, 50),
    ).resolves.toEqual({
      items: [
        {
          id: 'log-id',
          entityId: 'entity-id',
          actorId: 'actor-id',
          action: 'UPDATE',
          requestIp: '192.0.2.10',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM assignment_log'),
      [50, 0],
    );
    expect(dataSource.query.mock.calls[0][0]).not.toContain(' old');
    expect(dataSource.query.mock.calls[0][0]).not.toContain(' new');
  });

  it('uses the fixed table allowlist for every supported audit resource', async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([]),
    };
    const service = new AuditoriaService(dataSource as unknown as DataSource);
    const tables: Array<[RecursoAuditoria, string]> = [
      [RecursoAuditoria.CUENTAS, 'user_account_log'],
      [RecursoAuditoria.DATOS_USUARIO, 'user_data_log'],
      [RecursoAuditoria.PERFILES, 'profile_log'],
      [RecursoAuditoria.CONDUCTORES, 'driver_log'],
      [RecursoAuditoria.CUADRILLAS, 'crew_log'],
      [RecursoAuditoria.INTEGRANTES, 'crew_member_log'],
      [RecursoAuditoria.MACRORUTAS, 'macroroute_log'],
      [RecursoAuditoria.MICRORUTAS, 'microroute_log'],
      [RecursoAuditoria.VEHICULOS, 'vehicle_log'],
      [RecursoAuditoria.ASIGNACIONES, 'assignment_log'],
    ];

    for (const [resource] of tables) {
      await service.listar(resource, 1, 10);
    }

    for (const [, table] of tables) {
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining(`FROM ${table}`),
        [10, 0],
      );
    }
    expect(dataSource.query).toHaveBeenCalledTimes(tables.length * 2);
  });

  it('calculates the offset and returns an empty page with a zero count', async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]),
    };
    const service = new AuditoriaService(dataSource as unknown as DataSource);

    await expect(
      service.listar(RecursoAuditoria.VEHICULOS, 4, 25),
    ).resolves.toEqual({
      items: [],
      total: 0,
      page: 4,
      limit: 25,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /FROM vehicle_log[\s\S]*ORDER BY created_at DESC[\s\S]*LIMIT \$1 OFFSET \$2/,
      ),
      [25, 75],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('SELECT COUNT(*)::text AS total FROM vehicle_log'),
    );
  });

  it('rejects an unsupported resource without querying the database', async () => {
    const dataSource = { query: jest.fn() };
    const service = new AuditoriaService(dataSource as unknown as DataSource);

    await expect(
      service.listar('not-allowlisted' as RecursoAuditoria, 1, 10),
    ).rejects.toThrow(
      new BadRequestException('El recurso de auditoría no es válido.'),
    );
    expect(dataSource.query).not.toHaveBeenCalled();
  });
});

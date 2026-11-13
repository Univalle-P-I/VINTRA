import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

import {
  createAuditContext,
  createManager,
} from '../../test/helpers/audit-mocks';
import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { ActualizarCuadrillaDto } from './dto/actualizar-cuadrilla.dto';
import { ActualizarIntegranteCuadrillaDto } from './dto/actualizar-integrante-cuadrilla.dto';
import { CrearCuadrillaDto } from './dto/crear-cuadrilla.dto';
import { CrearIntegranteCuadrillaDto } from './dto/crear-integrante-cuadrilla.dto';
import { Cuadrilla } from './entidades/cuadrilla.entity';
import { IntegranteCuadrilla } from './entidades/integrante-cuadrilla.entity';
import { CuadrillasService } from './cuadrillas.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const CREW_ID = 'c0a80101-0000-4000-8000-000000000001';
const MEMBER_ID = 'c0a80101-0000-4000-8000-000000000002';

function createService(
  crewRepository: object = {},
  memberRepository: object = {},
  auditContext: object = {},
): CuadrillasService {
  return new CuadrillasService(
    crewRepository as unknown as Repository<Cuadrilla>,
    memberRepository as unknown as Repository<IntegranteCuadrilla>,
    auditContext as unknown as ContextoAuditoriaService,
  );
}

describe('CuadrillasService', () => {
  describe('listar', () => {
    it('returns crews ordered by name', async () => {
      const crews = [
        { id: CREW_ID, nombre: 'Aseo norte', activo: true },
        { id: 'crew-2', nombre: 'Aseo sur', activo: false },
      ];
      const crewRepository = {
        find: jest.fn().mockResolvedValue(crews),
      };
      const service = createService(crewRepository);

      await expect(service.listar()).resolves.toEqual(crews);
      expect(crewRepository.find).toHaveBeenCalledWith({
        order: { nombre: 'ASC' },
      });
    });
  });

  describe('obtener', () => {
    it('returns the requested crew', async () => {
      const crew = { id: CREW_ID, nombre: 'Aseo norte', activo: true };
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(crew),
      };
      const service = createService(crewRepository);

      await expect(service.obtener(CREW_ID)).resolves.toBe(crew);
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID },
      });
    });

    it('throws NotFoundException when the crew does not exist', async () => {
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService(crewRepository);

      await expect(service.obtener(CREW_ID)).rejects.toThrow(
        new NotFoundException('La cuadrilla no existe.'),
      );
    });
  });

  describe('crear', () => {
    it('creates an active crew within the audit transaction', async () => {
      const crewRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: CREW_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([[Cuadrilla, crewRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: CrearCuadrillaDto = { name: 'Aseo norte' };

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toEqual({
        id: CREW_ID,
        nombre: 'Aseo norte',
        activo: true,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(manager.getRepository).toHaveBeenCalledWith(Cuadrilla);
      expect(crewRepository.create).toHaveBeenCalledWith({
        nombre: 'Aseo norte',
        activo: true,
      });
      expect(crewRepository.save).toHaveBeenCalledWith({
        nombre: 'Aseo norte',
        activo: true,
      });
    });
  });

  describe('actualizar', () => {
    it('updates supplied fields and preserves omitted crew values', async () => {
      const crew = { id: CREW_ID, nombre: 'Cuadrilla anterior', activo: true };
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(crew),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[Cuadrilla, crewRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: ActualizarCuadrillaDto = {
        name: 'Aseo norte',
        isActive: false,
      };

      await expect(
        service.actualizar(CREW_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: CREW_ID,
        nombre: 'Aseo norte',
        activo: false,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID },
      });
      expect(crewRepository.save).toHaveBeenCalledWith(crew);
    });

    it('throws NotFoundException when the crew does not exist', async () => {
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Cuadrilla, crewRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizar(
          CREW_ID,
          { name: 'Aseo norte' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(new NotFoundException('La cuadrilla no existe.'));
      expect(crewRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listarIntegrantes', () => {
    it('returns members with their crew relation ordered by full name', async () => {
      const members = [
        {
          id: MEMBER_ID,
          nombreCompleto: 'Ana Pérez',
          cuadrilla: { id: CREW_ID },
        },
      ];
      const memberRepository = {
        find: jest.fn().mockResolvedValue(members),
      };
      const service = createService({}, memberRepository);

      await expect(service.listarIntegrantes()).resolves.toEqual(members);
      expect(memberRepository.find).toHaveBeenCalledWith({
        relations: { cuadrilla: true },
        order: { nombreCompleto: 'ASC' },
      });
    });
  });

  describe('crearIntegrante', () => {
    const dto: CrearIntegranteCuadrillaDto = {
      crewId: CREW_ID,
      fullName: 'Ana Pérez',
    };

    it('creates a member attached to an active crew', async () => {
      const crew = { id: CREW_ID, activo: true };
      const memberRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: MEMBER_ID, ...value })),
      };
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(crew),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Cuadrilla, crewRepository],
          [IntegranteCuadrilla, memberRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);

      await expect(
        service.crearIntegrante(dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: MEMBER_ID,
        cuadrilla: crew,
        nombreCompleto: 'Ana Pérez',
        activo: true,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID, activo: true },
      });
      expect(manager.getRepository).toHaveBeenNthCalledWith(1, Cuadrilla);
      expect(manager.getRepository).toHaveBeenNthCalledWith(
        2,
        IntegranteCuadrilla,
      );
      expect(memberRepository.create).toHaveBeenCalledWith({
        cuadrilla: crew,
        nombreCompleto: 'Ana Pérez',
        activo: true,
      });
    });

    it('rejects a missing or inactive crew', async () => {
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const memberRepository = {
        create: jest.fn(),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Cuadrilla, crewRepository],
          [IntegranteCuadrilla, memberRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crearIntegrante(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new NotFoundException('La cuadrilla no existe o está inactiva.'),
      );
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID, activo: true },
      });
      expect(memberRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('actualizarIntegrante', () => {
    it('partially updates a member and unassigns its crew when crewId is null', async () => {
      const crew = { id: CREW_ID };
      const member = {
        id: MEMBER_ID,
        cuadrilla: crew,
        nombreCompleto: 'Nombre anterior',
        activo: true,
      };
      const memberRepository = {
        findOne: jest.fn().mockResolvedValue(member),
        save: jest.fn(async (value) => value),
      };
      const crewRepository = { findOne: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [IntegranteCuadrilla, memberRepository],
          [Cuadrilla, crewRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: ActualizarIntegranteCuadrillaDto = {
        crewId: null,
        fullName: 'Ana Pérez',
      };

      await expect(
        service.actualizarIntegrante(MEMBER_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: MEMBER_ID,
        cuadrilla: null,
        nombreCompleto: 'Ana Pérez',
        activo: true,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(memberRepository.findOne).toHaveBeenCalledWith({
        where: { id: MEMBER_ID },
        relations: { cuadrilla: true },
      });
      expect(memberRepository.save).toHaveBeenCalledWith(member);
      expect(crewRepository.findOne).not.toHaveBeenCalled();
    });

    it('reassigns a member only to an active crew', async () => {
      const crew = { id: CREW_ID, activo: true };
      const member = {
        id: MEMBER_ID,
        cuadrilla: null,
        nombreCompleto: 'Ana Pérez',
        activo: true,
      };
      const memberRepository = {
        findOne: jest.fn().mockResolvedValue(member),
        save: jest.fn(async (value) => value),
      };
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(crew),
      };
      const manager = createManager(
        new Map<Function, object>([
          [IntegranteCuadrilla, memberRepository],
          [Cuadrilla, crewRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizarIntegrante(
          MEMBER_ID,
          { crewId: CREW_ID, isActive: false },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toMatchObject({ cuadrilla: crew, activo: false });

      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID, activo: true },
      });
      expect(memberRepository.save).toHaveBeenCalledWith(member);
    });

    it('throws NotFoundException when the member does not exist', async () => {
      const memberRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[IntegranteCuadrilla, memberRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizarIntegrante(
          MEMBER_ID,
          { fullName: 'Ana Pérez' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(new NotFoundException('El integrante no existe.'));
      expect(memberRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a missing or inactive replacement crew', async () => {
      const memberRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: MEMBER_ID,
          cuadrilla: { id: 'old-crew-id' },
          nombreCompleto: 'Ana Pérez',
          activo: true,
        }),
        save: jest.fn(),
      };
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const manager = createManager(
        new Map<Function, object>([
          [IntegranteCuadrilla, memberRepository],
          [Cuadrilla, crewRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizarIntegrante(
          MEMBER_ID,
          { crewId: 'inactive-crew-id' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new NotFoundException('La cuadrilla no existe o está inactiva.'),
      );
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'inactive-crew-id', activo: true },
      });
      expect(memberRepository.save).not.toHaveBeenCalled();
    });
  });
});

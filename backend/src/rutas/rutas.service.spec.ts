import { ConflictException, NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';
import type { Repository } from 'typeorm';

import {
  createAuditContext,
  createManager,
} from '../../test/helpers/audit-mocks';
import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Barrio } from './entidades/barrio.entity';
import { Macroruta } from './entidades/macroruta.entity';
import { MicrorutaBarrio } from './entidades/microruta-barrio.entity';
import { Microruta } from './entidades/microruta.entity';
import { RutasService } from './rutas.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const BARRIO_ID = 'c0a80101-0000-4000-8000-000000000001';
const MACRORUTA_ID = 'c0a80101-0000-4000-8000-000000000002';
const MICRORUTA_ID = 'c0a80101-0000-4000-8000-000000000003';
const LINK_ID = 'c0a80101-0000-4000-8000-000000000004';
const MULTIPOLYGON = { type: 'MultiPolygon', coordinates: [] };
const MULTILINESTRING = { type: 'MultiLineString', coordinates: [] };

function createService(
  repositories: {
    barrio?: object;
    macroruta?: object;
    microruta?: object;
    link?: object;
    auditContext?: object;
  } = {},
): RutasService {
  return new RutasService(
    (repositories.barrio ?? {}) as unknown as Repository<Barrio>,
    (repositories.macroruta ?? {}) as unknown as Repository<Macroruta>,
    (repositories.microruta ?? {}) as unknown as Repository<Microruta>,
    (repositories.link ?? {}) as unknown as Repository<MicrorutaBarrio>,
    (repositories.auditContext ?? {}) as unknown as ContextoAuditoriaService,
  );
}

describe('RutasService', () => {
  describe('listarBarrios', () => {
    it('filters by name and commune and applies pagination', async () => {
      const items = [{ id: BARRIO_ID, nombre: 'Centro', comuna: 'Comuna 1' }];
      const barrioRepository = {
        findAndCount: jest.fn().mockResolvedValue([items, 12]),
      };
      const service = createService({ barrio: barrioRepository });

      await expect(
        service.listarBarrios({
          name: 'Centro',
          commune: 'Comuna 1',
          page: 2,
          limit: 5,
        }),
      ).resolves.toEqual({ items, total: 12, page: 2, limit: 5 });

      expect(barrioRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          nombre: ILike('%Centro%'),
          comuna: ILike('%Comuna 1%'),
        },
        order: { nombre: 'ASC' },
        skip: 5,
        take: 5,
      });
    });
  });

  describe('obtenerBarrio', () => {
    it('returns a barrio by ID', async () => {
      const barrio = { id: BARRIO_ID, nombre: 'Centro' };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(barrio),
      };
      const service = createService({ barrio: barrioRepository });

      await expect(service.obtenerBarrio(BARRIO_ID)).resolves.toBe(barrio);
      expect(barrioRepository.findOne).toHaveBeenCalledWith({
        where: { id: BARRIO_ID },
      });
    });

    it('throws NotFoundException when the barrio does not exist', async () => {
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService({ barrio: barrioRepository });

      await expect(service.obtenerBarrio(BARRIO_ID)).rejects.toThrow(
        new NotFoundException('El barrio no existe.'),
      );
    });
  });

  describe('crearBarrio', () => {
    it('maps optional commune and geometry into the entity transactionally', async () => {
      const barrioRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: BARRIO_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([[Barrio, barrioRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({ auditContext });

      await expect(
        service.crearBarrio(
          { name: 'Centro', geometry: MULTIPOLYGON },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: BARRIO_ID,
        comuna: null,
        nombre: 'Centro',
        geometria: MULTIPOLYGON,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(barrioRepository.create).toHaveBeenCalledWith({
        comuna: null,
        nombre: 'Centro',
        geometria: MULTIPOLYGON,
      });
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const barrioRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([[Barrio, barrioRepository]]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearBarrio(
          { name: 'Centro', geometry: MULTIPOLYGON },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new ConflictException('Ya existe un barrio con ese nombre.'),
      );
    });
  });

  describe('actualizarBarrio', () => {
    it('updates only supplied fields and preserves the remaining barrio data', async () => {
      const barrio = {
        id: BARRIO_ID,
        comuna: 'Comuna 1',
        nombre: 'Centro',
        geometria: MULTIPOLYGON,
      };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(barrio),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[Barrio, barrioRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({ auditContext });

      await expect(
        service.actualizarBarrio(
          BARRIO_ID,
          { name: 'Centro histórico' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: BARRIO_ID,
        comuna: 'Comuna 1',
        nombre: 'Centro histórico',
        geometria: MULTIPOLYGON,
      });

      expect(barrioRepository.findOne).toHaveBeenCalledWith({
        where: { id: BARRIO_ID },
      });
      expect(barrioRepository.save).toHaveBeenCalledWith(barrio);
      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
    });

    it('throws NotFoundException when the barrio does not exist', async () => {
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Barrio, barrioRepository]]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.actualizarBarrio(
          BARRIO_ID,
          { name: 'Centro' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(new NotFoundException('El barrio no existe.'));
      expect(barrioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listarMacrorutas', () => {
    it('returns macroroutes ordered by code', async () => {
      const routes = [{ id: MACRORUTA_ID, codigo: 'M-01' }];
      const macrorutaRepository = {
        find: jest.fn().mockResolvedValue(routes),
      };
      const service = createService({ macroruta: macrorutaRepository });

      await expect(service.listarMacrorutas()).resolves.toEqual(routes);
      expect(macrorutaRepository.find).toHaveBeenCalledWith({
        order: { codigo: 'ASC' },
      });
    });
  });

  describe('obtenerMacroruta', () => {
    it('throws NotFoundException when the macroroute does not exist', async () => {
      const macrorutaRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService({ macroruta: macrorutaRepository });

      await expect(service.obtenerMacroruta(MACRORUTA_ID)).rejects.toThrow(
        new NotFoundException('La macroruta no existe.'),
      );
      expect(macrorutaRepository.findOne).toHaveBeenCalledWith({
        where: { id: MACRORUTA_ID },
      });
    });
  });

  describe('crearMacroruta', () => {
    it('maps route fields into the entity within the audit transaction', async () => {
      const macrorutaRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: MACRORUTA_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([[Macroruta, macrorutaRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({ auditContext });

      await expect(
        service.crearMacroruta(
          { code: 'M-01', name: 'Norte', geometry: MULTILINESTRING },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: MACRORUTA_ID,
        codigo: 'M-01',
        nombre: 'Norte',
        geometria: MULTILINESTRING,
      });
      expect(macrorutaRepository.create).toHaveBeenCalledWith({
        codigo: 'M-01',
        nombre: 'Norte',
        geometria: MULTILINESTRING,
      });
      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const macrorutaRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([[Macroruta, macrorutaRepository]]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMacroruta(
          { code: 'M-01', name: 'Norte', geometry: MULTILINESTRING },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new ConflictException('Ya existe una macroruta con ese código.'),
      );
    });
  });

  describe('actualizarMacroruta', () => {
    it('applies a partial update without overwriting omitted fields', async () => {
      const macroroute = {
        id: MACRORUTA_ID,
        codigo: 'M-01',
        nombre: 'Norte',
        geometria: MULTILINESTRING,
      };
      const repository = {
        findOne: jest.fn().mockResolvedValue(macroroute),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[Macroruta, repository]]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.actualizarMacroruta(
          MACRORUTA_ID,
          { name: 'Norte ampliada' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: MACRORUTA_ID,
        codigo: 'M-01',
        nombre: 'Norte ampliada',
        geometria: MULTILINESTRING,
      });
      expect(repository.save).toHaveBeenCalledWith(macroroute);
    });
  });

  describe('listarMicrorutas', () => {
    it('filters, paginates, and omits geometry when requested', async () => {
      const items = [{ id: MICRORUTA_ID, codigo: 'm-01', nombre: 'Centro' }];
      const query = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([items, 3]),
      };
      const microrutaRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(query),
      };
      const service = createService({ microruta: microrutaRepository });

      await expect(
        service.listarMicrorutas({
          macrorouteId: MACRORUTA_ID,
          search: 'Centro',
          includeGeometry: false,
          page: 2,
          limit: 10,
        }),
      ).resolves.toEqual({ items, total: 3, page: 2, limit: 10 });

      expect(microrutaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'route',
      );
      expect(query.leftJoinAndSelect).toHaveBeenCalledWith(
        'route.macroruta',
        'macro',
      );
      expect(query.andWhere).toHaveBeenNthCalledWith(
        1,
        'macro.id = :macrorouteId',
        { macrorouteId: MACRORUTA_ID },
      );
      expect(query.andWhere).toHaveBeenNthCalledWith(
        2,
        '(route.nombre ILIKE :search OR route.codigo ILIKE :search)',
        { search: '%Centro%' },
      );
      expect(query.select).toHaveBeenCalledWith([
        'route.id',
        'route.codigo',
        'route.nombre',
        'route.actualizadoEn',
        'route.creadoEn',
        'macro.id',
        'macro.codigo',
        'macro.nombre',
      ]);
      expect(query.orderBy).toHaveBeenCalledWith('route.codigo', 'ASC');
      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.take).toHaveBeenCalledWith(10);
    });
  });

  describe('obtenerMicroruta', () => {
    it('loads the parent macroroute and throws when the route is missing', async () => {
      const microrutaRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService({ microruta: microrutaRepository });

      await expect(service.obtenerMicroruta(MICRORUTA_ID)).rejects.toThrow(
        new NotFoundException('La microruta no existe.'),
      );
      expect(microrutaRepository.findOne).toHaveBeenCalledWith({
        where: { id: MICRORUTA_ID },
        relations: { macroruta: true },
      });
    });
  });

  describe('crearMicroruta', () => {
    const dto = {
      macrorouteId: MACRORUTA_ID,
      code: 'm-01',
      name: 'Centro',
      geometry: MULTILINESTRING,
    };

    it('requires the parent macroroute and creates the route', async () => {
      const macro = { id: MACRORUTA_ID };
      const macroRepository = {
        findOne: jest.fn().mockResolvedValue(macro),
      };
      const microrouteRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: MICRORUTA_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Macroruta, macroRepository],
          [Microruta, microrouteRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({ auditContext });

      await expect(
        service.crearMicroruta(dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: MICRORUTA_ID,
        macroruta: macro,
        codigo: 'm-01',
        nombre: 'Centro',
        geometria: MULTILINESTRING,
      });
      expect(macroRepository.findOne).toHaveBeenCalledWith({
        where: { id: MACRORUTA_ID },
      });
      expect(microrouteRepository.create).toHaveBeenCalledWith({
        macroruta: macro,
        codigo: 'm-01',
        nombre: 'Centro',
        geometria: MULTILINESTRING,
      });
    });

    it('throws NotFoundException when the parent macroroute is missing', async () => {
      const macroRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const microrouteRepository = {
        create: jest.fn(),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Macroruta, macroRepository],
          [Microruta, microrouteRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMicroruta(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(new NotFoundException('La macroruta no existe.'));
      expect(microrouteRepository.save).not.toHaveBeenCalled();
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const macroRepository = {
        findOne: jest.fn().mockResolvedValue({ id: MACRORUTA_ID }),
      };
      const microrouteRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Macroruta, macroRepository],
          [Microruta, microrouteRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMicroruta(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new ConflictException('Ya existe una microruta con ese código.'),
      );
    });
  });

  describe('actualizarMicroruta', () => {
    it('reassigns a macroroute and preserves fields omitted from the update', async () => {
      const route = {
        id: MICRORUTA_ID,
        macroruta: { id: MACRORUTA_ID },
        codigo: 'm-01',
        nombre: 'Centro',
        geometria: MULTILINESTRING,
      };
      const macro = { id: 'c0a80101-0000-4000-8000-000000000005' };
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue(route),
        save: jest.fn(async (value) => value),
      };
      const macroRepository = {
        findOne: jest.fn().mockResolvedValue(macro),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Macroruta, macroRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.actualizarMicroruta(
          MICRORUTA_ID,
          { macrorouteId: macro.id, name: 'Centro ampliada' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: MICRORUTA_ID,
        macroruta: macro,
        codigo: 'm-01',
        nombre: 'Centro ampliada',
        geometria: MULTILINESTRING,
      });
      expect(macroRepository.findOne).toHaveBeenCalledWith({
        where: { id: macro.id },
      });
      expect(routeRepository.save).toHaveBeenCalledWith(route);
    });
  });

  describe('listarBarriosMicroruta', () => {
    it('filters by microroute and orders associations by visit sequence', async () => {
      const links = [{ id: LINK_ID, ordenVisita: 1 }];
      const linkRepository = {
        find: jest.fn().mockResolvedValue(links),
      };
      const service = createService({ link: linkRepository });

      await expect(
        service.listarBarriosMicroruta(MICRORUTA_ID),
      ).resolves.toEqual(links);
      expect(linkRepository.find).toHaveBeenCalledWith({
        where: { microruta: { id: MICRORUTA_ID } },
        relations: { microruta: true, barrio: true },
        order: { ordenVisita: 'ASC' },
      });
    });
  });

  describe('crearMicrorutaBarrio', () => {
    const dto = {
      microrouteId: MICRORUTA_ID,
      neighborhoodId: BARRIO_ID,
      orderVisit: 1,
    };

    it('creates an association after resolving its microroute and barrio', async () => {
      const route = { id: MICRORUTA_ID };
      const barrio = { id: BARRIO_ID };
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue(route),
      };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(barrio),
      };
      const linkRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: LINK_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Barrio, barrioRepository],
          [MicrorutaBarrio, linkRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMicrorutaBarrio(dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: LINK_ID,
        microruta: route,
        barrio,
        ordenVisita: 1,
      });
      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: MICRORUTA_ID },
      });
      expect(barrioRepository.findOne).toHaveBeenCalledWith({
        where: { id: BARRIO_ID },
      });
      expect(linkRepository.create).toHaveBeenCalledWith({
        microruta: route,
        barrio,
        ordenVisita: 1,
      });
    });

    it('translates duplicate association violations to ConflictException', async () => {
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue({ id: MICRORUTA_ID }),
      };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue({ id: BARRIO_ID }),
      };
      const linkRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Barrio, barrioRepository],
          [MicrorutaBarrio, linkRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMicrorutaBarrio(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new ConflictException(
          'La microruta ya tiene ese barrio o número de orden.',
        ),
      );
    });

    it('throws NotFoundException when the barrio does not exist', async () => {
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue({ id: MICRORUTA_ID }),
      };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const linkRepository = {
        create: jest.fn(),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Barrio, barrioRepository],
          [MicrorutaBarrio, linkRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.crearMicrorutaBarrio(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(new NotFoundException('El barrio no existe.'));
      expect(linkRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('actualizarMicrorutaBarrio', () => {
    it('updates associated route, barrio, and order only when supplied', async () => {
      const link = {
        id: LINK_ID,
        microruta: { id: MICRORUTA_ID },
        barrio: { id: BARRIO_ID },
        ordenVisita: 1,
      };
      const route = { id: 'c0a80101-0000-4000-8000-000000000005' };
      const barrio = { id: 'c0a80101-0000-4000-8000-000000000006' };
      const linkRepository = {
        findOne: jest.fn().mockResolvedValue(link),
        save: jest.fn(async (value) => value),
      };
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue(route),
      };
      const barrioRepository = {
        findOne: jest.fn().mockResolvedValue(barrio),
      };
      const manager = createManager(
        new Map<Function, object>([
          [MicrorutaBarrio, linkRepository],
          [Microruta, routeRepository],
          [Barrio, barrioRepository],
        ]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.actualizarMicrorutaBarrio(
          LINK_ID,
          {
            microrouteId: route.id,
            neighborhoodId: barrio.id,
            orderVisit: 2,
          },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: LINK_ID,
        microruta: route,
        barrio,
        ordenVisita: 2,
      });
      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: route.id },
      });
      expect(barrioRepository.findOne).toHaveBeenCalledWith({
        where: { id: barrio.id },
      });
      expect(linkRepository.save).toHaveBeenCalledWith(link);
    });

    it('throws NotFoundException when the association does not exist', async () => {
      const linkRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[MicrorutaBarrio, linkRepository]]),
      );
      const service = createService({
        auditContext: createAuditContext(manager),
      });

      await expect(
        service.actualizarMicrorutaBarrio(
          LINK_ID,
          { orderVisit: 2 },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new NotFoundException('La asociación microruta-barrio no existe.'),
      );
      expect(linkRepository.save).not.toHaveBeenCalled();
    });
  });
});

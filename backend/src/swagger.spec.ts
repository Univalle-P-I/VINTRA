import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AsignacionesController } from './asignaciones/asignaciones.controller';
import { AsignacionesService } from './asignaciones/asignaciones.service';
import { AuditoriaController } from './auditoria/auditoria.controller';
import { AuditoriaService } from './auditoria/auditoria.service';
import { AutenticacionController } from './autenticacion/autenticacion.controller';
import { AutenticacionService } from './autenticacion/autenticacion.service';
import { Sesion } from './autenticacion/entidades/sesion.entity';
import { CuadrillasController } from './cuadrillas/cuadrillas.controller';
import { CuadrillasService } from './cuadrillas/cuadrillas.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './salud/health.controller';
import { CuentaUsuario } from './usuarios/entidades/cuenta-usuario.entity';
import { UsuariosController } from './usuarios/usuarios.controller';
import { UsuariosService } from './usuarios/usuarios.service';
import { PerfilesController } from './perfiles/perfiles.controller';
import { PerfilesService } from './perfiles/perfiles.service';
import { Perfil } from './perfiles/entidades/perfil.entity';
import { VehiculosController } from './vehiculos/vehiculos.controller';
import { VehiculosService } from './vehiculos/vehiculos.service';
import { PersonalController } from './personal/personal.controller';
import { PersonalService } from './personal/personal.service';
import { RutasController } from './rutas/rutas.controller';
import { RutasService } from './rutas/rutas.service';
import { TurnosController } from './turnos/turnos.controller';
import { TurnosService } from './turnos/turnos.service';
import { SeguimientoController } from './seguimiento/seguimiento.controller';
import { SeguimientoService } from './seguimiento/seguimiento.service';
import { setupSwagger } from './swagger';

describe('Swagger OpenAPI configuration', () => {
  it('documents implemented routes and security without a database connection', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AppController,
        HealthController,
        AutenticacionController,
        UsuariosController,
        PerfilesController,
        VehiculosController,
        PersonalController,
        CuadrillasController,
        RutasController,
        TurnosController,
        AsignacionesController,
        SeguimientoController,
        AuditoriaController,
      ],
      providers: [
        { provide: AppService, useValue: {} },
        { provide: DataSource, useValue: { query: jest.fn() } },
        { provide: UsuariosService, useValue: {} },
        { provide: PerfilesService, useValue: {} },
        { provide: VehiculosService, useValue: {} },
        { provide: PersonalService, useValue: {} },
        { provide: CuadrillasService, useValue: {} },
        { provide: RutasService, useValue: {} },
        { provide: TurnosService, useValue: {} },
        { provide: AsignacionesService, useValue: {} },
        { provide: SeguimientoService, useValue: {} },
        { provide: AuditoriaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Sesion),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CuentaUsuario),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Perfil),
          useValue: {},
        },
        {
          provide: AutenticacionService,
          useValue: { login: jest.fn(), logout: jest.fn() },
        },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();

    try {
      const document = setupSwagger(app);
      const login = document.paths['/api/v1/auth/login']?.post;
      const logout = document.paths['/api/v1/auth/logout']?.post;
      const personal = document.paths['/api/v1/personal/conductores']?.get;
      const assignment = document.paths['/api/v1/assignments']?.get;
      const health = document.paths['/health']?.get;
      const databaseHealth = document.paths['/health/db']?.get;
      const createVehicle = document.paths['/api/v1/vehicles']?.post;

      expect(document.components?.securitySchemes?.['access-token']).toMatchObject({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });
      expect(login?.requestBody).toBeDefined();
      expect(login?.responses).toHaveProperty('200');
      expect(login?.security).toBeUndefined();
      expect(logout?.responses).toHaveProperty('204');
      expect(logout?.security).toEqual([{ 'access-token': [] }]);
      expect(personal).toBeDefined();
      expect(assignment?.security).toEqual([{ 'access-token': [] }]);
      expect(health?.security).toBeUndefined();
      expect(databaseHealth?.responses).toHaveProperty('503');
      expect(createVehicle?.requestBody).toBeDefined();
      expect(createVehicle?.responses).toHaveProperty('201');
      expect(createVehicle?.security).toEqual([{ 'access-token': [] }]);
      expect(document.paths['/personal/conductores']).toBeUndefined();
      expect(document.paths['/api/v1/auth/password-reset']).toBeUndefined();

      await app.init();
      const uiResponse = await request(app.getHttpServer()).get('/api/docs/');
      const jsonResponse = await request(app.getHttpServer()).get(
        '/api/docs-json',
      );

      expect(uiResponse.status).toBe(200);
      expect(jsonResponse.status).toBe(200);
      expect(jsonResponse.body.info.title).toBe('VINTRA API');
      expect(jsonResponse.body.paths['/api/v1/personal/conductores']).toBeDefined();
    } finally {
      await app.close();
    }
  });
});

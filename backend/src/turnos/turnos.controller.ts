import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { UsuarioAutenticado } from '../autenticacion/usuario-autenticado.decorator';
import { ApiEndpoint } from '../comun/swagger.decorator';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ActualizarHorarioDto } from './dto/actualizar-horario.dto';
import { ActualizarMicrorutaHorarioDto } from './dto/actualizar-microruta-horario.dto';
import { ConsultarMicrorutaHorariosDto } from './dto/consultar-microruta-horarios.dto';
import { ConsultarTurnosDto } from './dto/consultar-turnos.dto';
import { CrearHorarioDto } from './dto/crear-horario.dto';
import { CrearMicrorutaHorarioDto } from './dto/crear-microruta-horario.dto';
import { TurnosService } from './turnos.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Turnos')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Get('schedules')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar horarios',
    responseDescription: 'Horarios que coinciden con los filtros de consulta.',
    responseShape: 'sizedPage',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400],
  })
  listar(@Query() query: ConsultarTurnosDto) {
    return this.turnosService.listar(query);
  }

  @Get('schedules/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del horario.' })
  @ApiEndpoint({
    summary: 'Consultar un horario',
    responseDescription: 'Horario solicitado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.turnosService.obtener(id);
  }

  @Post('schedules')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear un horario',
    status: 201,
    responseDescription: 'Horario creado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 409],
  })
  crear(
    @Body() dto: CrearHorarioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.turnosService.crear(dto, actor.userId, ip);
  }

  @Patch('schedules/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del horario.' })
  @ApiEndpoint({
    summary: 'Actualizar un horario',
    responseDescription: 'Horario actualizado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarHorarioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.turnosService.actualizar(id, dto, actor.userId, ip);
  }

  @Get('microroute-schedules')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar horarios asociados a microrutas',
    responseDescription: 'Asociaciones disponibles según los filtros.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400],
  })
  listarMicrorutaHorarios(@Query() query: ConsultarMicrorutaHorariosDto) {
    return this.turnosService.listarMicrorutaHorarios(query);
  }

  @Post('microroute-schedules')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Asociar un horario a una microruta',
    status: 201,
    responseDescription: 'Asociación creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crearMicrorutaHorario(
    @Body() dto: CrearMicrorutaHorarioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.turnosService.crearMicrorutaHorario(dto, actor.userId, ip);
  }

  @Patch('microroute-schedules/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID del horario asociado a la microruta.',
  })
  @ApiEndpoint({
    summary: 'Actualizar un horario asociado a una microruta',
    responseDescription: 'Asociación actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarMicrorutaHorario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMicrorutaHorarioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.turnosService.actualizarMicrorutaHorario(
      id,
      dto,
      actor.userId,
      ip,
    );
  }
}

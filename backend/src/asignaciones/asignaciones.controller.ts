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
import { ActualizarAsignacionDto } from './dto/actualizar-asignacion.dto';
import { ConsultarAsignacionesDto } from './dto/consultar-asignaciones.dto';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { AsignacionesService } from './asignaciones.service';

@Controller('api/v1/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Asignaciones')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Listar asignaciones',
    responseDescription: 'Página de asignaciones que coincide con los filtros.',
    responseShape: 'page',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400],
  })
  listar(@Query() query: ConsultarAsignacionesDto) {
    return this.asignacionesService.listar(query);
  }

  @Get('me')
  @Roles(RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar asignaciones del conductor autenticado',
    responseDescription: 'Página con las asignaciones propias.',
    responseShape: 'page',
    roles: [RolUsuario.DRIVER],
    errors: [400],
  })
  listarPropias(
    @Query() query: ConsultarAsignacionesDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
  ) {
    return this.asignacionesService.listarPropias(actor.userId, query);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la asignación.' })
  @ApiEndpoint({
    summary: 'Consultar una asignación',
    responseDescription: 'Asignación y sus relaciones operativas.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.asignacionesService.obtener(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear una asignación',
    status: 201,
    responseDescription: 'Asignación creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crear(
    @Body() dto: CrearAsignacionDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.asignacionesService.crear(dto, actor.userId, ip);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la asignación.' })
  @ApiEndpoint({
    summary: 'Actualizar una asignación',
    responseDescription: 'Asignación actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarAsignacionDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.asignacionesService.actualizar(id, dto, actor.userId, ip);
  }
}

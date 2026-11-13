import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
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
import { ConsultarPosicionesDto } from './dto/consultar-posiciones.dto';
import { CrearPosicionVehiculoDto } from './dto/crear-posicion-vehiculo.dto';
import { SeguimientoService } from './seguimiento.service';

@Controller('api/v1/vehicle-positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Seguimiento')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @Get('assignments/:assignmentId')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({
    name: 'assignmentId',
    format: 'uuid',
    description: 'ID de la asignación.',
  })
  @ApiEndpoint({
    summary: 'Consultar posiciones de una asignación',
    responseDescription: 'Posiciones registradas para la asignación.',
    responseShape: 'page',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  listarAdministrativo(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Query() query: ConsultarPosicionesDto,
  ) {
    return this.seguimientoService.listar(assignmentId, query);
  }

  @Get('me/assignments/:assignmentId')
  @Roles(RolUsuario.DRIVER)
  @ApiParam({
    name: 'assignmentId',
    format: 'uuid',
    description: 'ID de una asignación propia.',
  })
  @ApiEndpoint({
    summary: 'Consultar posiciones de una asignación propia',
    responseDescription: 'Posiciones de la asignación propia.',
    responseShape: 'page',
    roles: [RolUsuario.DRIVER],
    errors: [400, 404],
  })
  listarPropio(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Query() query: ConsultarPosicionesDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
  ) {
    return this.seguimientoService.listar(
      assignmentId,
      query,
      actor.userId,
    );
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Registrar una posición de vehículo',
    status: 201,
    responseDescription: 'Posición geográfica creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  crearAdministrativo(
    @Body() dto: CrearPosicionVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.seguimientoService.crear(dto, actor.userId, ip);
  }

  @Post('me')
  @Roles(RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Registrar una posición propia',
    status: 201,
    responseDescription: 'Posición geográfica creada para una asignación propia.',
    roles: [RolUsuario.DRIVER],
    errors: [400, 404],
  })
  crearPropio(
    @Body() dto: CrearPosicionVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.seguimientoService.crear(
      dto,
      actor.userId,
      ip,
      actor.userId,
    );
  }
}

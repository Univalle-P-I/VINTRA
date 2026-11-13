import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiEndpoint } from '../comun/swagger.decorator';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { UsuarioAutenticado } from '../autenticacion/usuario-autenticado.decorator';
import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ActualizarTipoVehiculoDto } from './dto/actualizar-tipo-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';
import { CrearTipoVehiculoDto } from './dto/crear-tipo-vehiculo.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { VehiculosService } from './vehiculos.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Vehículos')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get('vehicle-types')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar tipos de vehículo',
    responseDescription: 'Catálogo de tipos de vehículo.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
  })
  listarTipos() {
    return this.vehiculosService.listarTipos();
  }

  @Post('vehicle-types')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear un tipo de vehículo',
    status: 201,
    responseDescription: 'Tipo de vehículo creado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 409],
  })
  crearTipo(
    @Body() dto: CrearTipoVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.crearTipo(dto, actor.userId, ip);
  }

  @Patch('vehicle-types/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID del tipo de vehículo.',
  })
  @ApiEndpoint({
    summary: 'Actualizar un tipo de vehículo',
    responseDescription: 'Tipo de vehículo actualizado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarTipo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarTipoVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.actualizarTipo(id, dto, actor.userId, ip);
  }

  @Get('vehicles')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar vehículos',
    responseDescription: 'Vehículos registrados.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
  })
  listar() {
    return this.vehiculosService.listar();
  }

  @Get('vehicles/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del vehículo.' })
  @ApiEndpoint({
    summary: 'Consultar un vehículo',
    responseDescription: 'Vehículo y tipo asociado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiculosService.obtener(id);
  }

  @Post('vehicles')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Registrar un vehículo',
    status: 201,
    responseDescription: 'Vehículo creado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crear(
    @Body() dto: CrearVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.crear(dto, actor.userId, ip);
  }

  @Patch('vehicles/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del vehículo.' })
  @ApiEndpoint({
    summary: 'Actualizar un vehículo',
    responseDescription: 'Vehículo actualizado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarVehiculoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.actualizar(id, dto, actor.userId, ip);
  }
}

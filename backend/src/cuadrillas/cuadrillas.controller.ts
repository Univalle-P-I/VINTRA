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
import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { UsuarioAutenticado } from '../autenticacion/usuario-autenticado.decorator';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ActualizarCuadrillaDto } from './dto/actualizar-cuadrilla.dto';
import { ActualizarIntegranteCuadrillaDto } from './dto/actualizar-integrante-cuadrilla.dto';
import { CrearCuadrillaDto } from './dto/crear-cuadrilla.dto';
import { CrearIntegranteCuadrillaDto } from './dto/crear-integrante-cuadrilla.dto';
import { CuadrillasService } from './cuadrillas.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Cuadrillas')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Get('crews')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar cuadrillas',
    responseDescription: 'Cuadrillas registradas.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
  })
  listar() {
    return this.cuadrillasService.listar();
  }

  @Get('crews/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la cuadrilla.' })
  @ApiEndpoint({
    summary: 'Consultar una cuadrilla',
    responseDescription: 'Cuadrilla solicitada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuadrillasService.obtener(id);
  }

  @Post('crews')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear una cuadrilla',
    status: 201,
    responseDescription: 'Cuadrilla creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 409],
  })
  crear(
    @Body() dto: CrearCuadrillaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.cuadrillasService.crear(dto, actor.userId, ip);
  }

  @Patch('crews/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la cuadrilla.' })
  @ApiEndpoint({
    summary: 'Actualizar una cuadrilla',
    responseDescription: 'Cuadrilla actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCuadrillaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.cuadrillasService.actualizar(id, dto, actor.userId, ip);
  }

  @Get('crew-members')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Listar integrantes de cuadrilla',
    responseDescription: 'Integrantes registrados.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
  })
  listarIntegrantes() {
    return this.cuadrillasService.listarIntegrantes();
  }

  @Post('crew-members')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Añadir un integrante de cuadrilla',
    status: 201,
    responseDescription: 'Integrante creado y asociado a una cuadrilla.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  crearIntegrante(
    @Body() dto: CrearIntegranteCuadrillaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.cuadrillasService.crearIntegrante(dto, actor.userId, ip);
  }

  @Patch('crew-members/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID del integrante de cuadrilla.',
  })
  @ApiEndpoint({
    summary: 'Actualizar un integrante de cuadrilla',
    responseDescription: 'Integrante actualizado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  actualizarIntegrante(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarIntegranteCuadrillaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.cuadrillasService.actualizarIntegrante(
      id,
      dto,
      actor.userId,
      ip,
    );
  }
}

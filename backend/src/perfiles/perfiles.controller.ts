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
import { RolUsuario } from './entidades/perfil.entity';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearPerfilDto } from './dto/crear-perfil.dto';
import { PerfilesService } from './perfiles.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Perfiles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  @Get('users/:userId/profiles')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'userId', format: 'uuid', description: 'ID de la cuenta.' })
  @ApiEndpoint({
    summary: 'Listar perfiles de una cuenta',
    responseDescription: 'Perfiles asociados a la cuenta.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  listar(
    @Param('userId', ParseUUIDPipe) userAccountId: string,
  ) {
    return this.perfilesService.listarPorCuenta(userAccountId);
  }

  @Post('profiles')
  @Roles(RolUsuario.ADMIN)
  @ApiEndpoint({
    summary: 'Crear un perfil',
    status: 201,
    responseDescription: 'Perfil creado y asociado a una cuenta.',
    roles: [RolUsuario.ADMIN],
    errors: [400, 404, 409],
  })
  crear(
    @Body() dto: CrearPerfilDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.perfilesService.crear(dto, actor.userId, ip);
  }

  @Patch('profiles/:id')
  @Roles(RolUsuario.ADMIN)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del perfil.' })
  @ApiEndpoint({
    summary: 'Actualizar el estado de un perfil',
    responseDescription: 'Perfil actualizado.',
    roles: [RolUsuario.ADMIN],
    errors: [400, 404],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPerfilDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.perfilesService.actualizar(id, dto, actor.userId, ip);
  }
}

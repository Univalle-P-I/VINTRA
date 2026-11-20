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
import { RolesGuard } from '../autenticacion/roles.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { UsuarioAutenticado } from '../autenticacion/usuario-autenticado.decorator';
import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ActualizarDatosUsuarioDto } from './dto/actualizar-datos-usuario.dto';
import { CrearUsuarioInternoDto } from './dto/crear-usuario-interno.dto';
import { UsuariosService } from './usuarios.service';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  @ApiEndpoint({
    summary: 'Crear una cuenta de usuario interna',
    status: 201,
    responseDescription: 'Cuenta creada con sus datos personales.',
    roles: [RolUsuario.ADMIN],
    errors: [400, 409],
  })
  crear(
    @Body() dto: CrearUsuarioInternoDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.usuariosService.crear(dto, actor.userId, ip);
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Listar usuarios',
    responseDescription: 'Colección de usuarios sin hashes de contraseña.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
  })
  listar() {
    return this.usuariosService.listar();
  }

  @Get('me')
  @ApiEndpoint({
    summary: 'Consultar el usuario autenticado',
    responseDescription: 'Datos públicos de la cuenta autenticada.',
    roles: ['cualquier usuario autenticado'],
  })
  obtenerPropio(@UsuarioAutenticado() user: AuthenticatedUser) {
    return this.usuariosService.obtenerPropio(user.userId);
  }

  @Patch('me')
  @ApiEndpoint({
    summary: 'Actualizar los datos del usuario autenticado',
    responseDescription: 'Datos públicos actualizados.',
    roles: ['cualquier usuario autenticado'],
    errors: [400, 409],
  })
  actualizarPropio(
    @Body() dto: ActualizarDatosUsuarioDto,
    @UsuarioAutenticado() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.usuariosService.actualizarPropio(
      user.userId,
      dto,
      user.userId,
      ip,
    );
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la cuenta.' })
  @ApiEndpoint({
    summary: 'Consultar un usuario por ID',
    responseDescription: 'Datos públicos de la cuenta solicitada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.obtener(id);
  }
}

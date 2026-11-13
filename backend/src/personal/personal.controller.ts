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

import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { UsuarioAutenticado } from '../autenticacion/usuario-autenticado.decorator';
import { ApiEndpoint } from '../comun/swagger.decorator';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ActualizarConductorDto } from './dto/actualizar-conductor.dto';
import { CrearConductorDto } from './dto/crear-conductor.dto';
import { PersonalService } from './personal.service';

@Controller('api/v1/personal/conductores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Personal')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Listar conductores',
    responseDescription: 'Conductores y datos públicos asociados.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
  })
  listar() {
    return this.personalService.listar();
  }

  @Get('me')
  @Roles(RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Consultar el perfil de conductor propio',
    responseDescription: 'Datos del conductor asociado al usuario autenticado.',
    roles: [RolUsuario.DRIVER],
    errors: [404],
  })
  obtenerPropio(@UsuarioAutenticado() user: AuthenticatedUser) {
    return this.personalService.obtenerPropio(user.userId);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del conductor.' })
  @ApiEndpoint({
    summary: 'Consultar un conductor',
    responseDescription: 'Conductor y datos públicos asociados.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404],
  })
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.personalService.obtener(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Registrar un conductor',
    status: 201,
    responseDescription:
      'Conductor creado con cuenta, datos personales y perfil asociado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crear(
    @Body() dto: CrearConductorDto,
    @UsuarioAutenticado() user: AuthenticatedUser,
    @Ip() requestIp: string,
  ) {
    return this.personalService.crear(dto, user.userId, requestIp);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del conductor.' })
  @ApiEndpoint({
    summary: 'Actualizar un conductor',
    responseDescription: 'Datos del conductor actualizados.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarConductorDto,
    @UsuarioAutenticado() user: AuthenticatedUser,
    @Ip() requestIp: string,
  ) {
    return this.personalService.actualizar(id, dto, user.userId, requestIp);
  }
}

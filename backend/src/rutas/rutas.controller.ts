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
  ApiQuery,
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
import { ActualizarBarrioDto } from './dto/actualizar-barrio.dto';
import { ActualizarMacrorutaDto } from './dto/actualizar-macroruta.dto';
import { ActualizarMicrorutaBarrioDto } from './dto/actualizar-microruta-barrio.dto';
import { ActualizarMicrorutaDto } from './dto/actualizar-microruta.dto';
import { ConsultarBarriosDto } from './dto/consultar-barrios.dto';
import { ConsultarMicrorutasDto } from './dto/consultar-microrutas.dto';
import { CrearBarrioDto } from './dto/crear-barrio.dto';
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { CrearMicrorutaBarrioDto } from './dto/crear-microruta-barrio.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { RutasService } from './rutas.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Rutas')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({
  description: 'El rol del usuario no permite la operación.',
})
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get('neighborhoods')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar barrios',
    responseDescription: 'Barrios que coinciden con los filtros de consulta.',
    responseShape: 'page',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400],
  })
  listarBarrios(@Query() query: ConsultarBarriosDto) {
    return this.rutasService.listarBarrios(query);
  }

  @Get('neighborhoods/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del barrio.' })
  @ApiEndpoint({
    summary: 'Consultar un barrio',
    responseDescription: 'Barrio solicitado y su geometría.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtenerBarrio(@Param('id', ParseUUIDPipe) id: string) {
    return this.rutasService.obtenerBarrio(id);
  }

  @Post('neighborhoods')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear un barrio',
    status: 201,
    responseDescription: 'Barrio creado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 409],
  })
  crearBarrio(
    @Body() dto: CrearBarrioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.crearBarrio(dto, actor.userId, ip);
  }

  @Patch('neighborhoods/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID del barrio.' })
  @ApiEndpoint({
    summary: 'Actualizar un barrio',
    responseDescription: 'Barrio actualizado.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarBarrio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarBarrioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.actualizarBarrio(id, dto, actor.userId, ip);
  }

  @Get('macroroutes')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar macrorutas',
    responseDescription: 'Macrorutas registradas.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
  })
  listarMacrorutas() {
    return this.rutasService.listarMacrorutas();
  }

  @Get('macroroutes/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la macroruta.' })
  @ApiEndpoint({
    summary: 'Consultar una macroruta',
    responseDescription: 'Macroruta solicitada y su geometría.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtenerMacroruta(@Param('id', ParseUUIDPipe) id: string) {
    return this.rutasService.obtenerMacroruta(id);
  }

  @Post('macroroutes')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear una macroruta',
    status: 201,
    responseDescription: 'Macroruta creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 409],
  })
  crearMacroruta(
    @Body() dto: CrearMacrorutaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.crearMacroruta(dto, actor.userId, ip);
  }

  @Patch('macroroutes/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la macroruta.' })
  @ApiEndpoint({
    summary: 'Actualizar una macroruta',
    responseDescription: 'Macroruta actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarMacroruta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMacrorutaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.actualizarMacroruta(id, dto, actor.userId, ip);
  }

  @Get('microroutes')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiEndpoint({
    summary: 'Listar microrutas',
    responseDescription: 'Microrutas que coinciden con los filtros.',
    responseShape: 'page',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400],
  })
  listarMicrorutas(@Query() query: ConsultarMicrorutasDto) {
    return this.rutasService.listarMicrorutas(query);
  }

  @Get('microroutes/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la microruta.' })
  @ApiEndpoint({
    summary: 'Consultar una microruta',
    responseDescription: 'Microruta solicitada y su geometría.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400, 404],
  })
  obtenerMicroruta(@Param('id', ParseUUIDPipe) id: string) {
    return this.rutasService.obtenerMicroruta(id);
  }

  @Post('microroutes')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Crear una microruta',
    status: 201,
    responseDescription: 'Microruta creada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crearMicroruta(
    @Body() dto: CrearMicrorutaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.crearMicroruta(dto, actor.userId, ip);
  }

  @Patch('microroutes/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la microruta.' })
  @ApiEndpoint({
    summary: 'Actualizar una microruta',
    responseDescription: 'Microruta actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarMicroruta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMicrorutaDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.actualizarMicroruta(id, dto, actor.userId, ip);
  }

  @Get('microroute-neighborhoods')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER)
  @ApiQuery({
    name: 'microrouteId',
    required: false,
    format: 'uuid',
    description: 'Filtra por ID de microruta.',
  })
  @ApiEndpoint({
    summary: 'Listar barrios asociados a microrutas',
    responseDescription: 'Asociaciones con su orden de visita.',
    responseShape: 'array',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER, RolUsuario.DRIVER],
    errors: [400],
  })
  listarBarriosMicroruta(
    @Query('microrouteId', new ParseUUIDPipe({ optional: true }))
    microrouteId?: string,
  ) {
    return this.rutasService.listarBarriosMicroruta(microrouteId);
  }

  @Post('microroute-neighborhoods')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiEndpoint({
    summary: 'Asociar un barrio a una microruta',
    status: 201,
    responseDescription: 'Asociación creada con su orden de visita.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  crearMicrorutaBarrio(
    @Body() dto: CrearMicrorutaBarrioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.crearMicrorutaBarrio(dto, actor.userId, ip);
  }

  @Patch('microroute-neighborhoods/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER)
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID de la asociación barrio-microruta.',
  })
  @ApiEndpoint({
    summary: 'Actualizar una asociación barrio-microruta',
    responseDescription: 'Asociación actualizada.',
    roles: [RolUsuario.ADMIN, RolUsuario.OPERATIONS_MANAGER],
    errors: [400, 404, 409],
  })
  actualizarMicrorutaBarrio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMicrorutaBarrioDto,
    @UsuarioAutenticado() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rutasService.actualizarMicrorutaBarrio(
      id,
      dto,
      actor.userId,
      ip,
    );
  }
}

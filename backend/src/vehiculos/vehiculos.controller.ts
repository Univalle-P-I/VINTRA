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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { roles } from '../common/enums/roles.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ActualizarEstadoVehiculoDto } from './dto/actualizar-estado-vehiculo.dto';
import { ActualizarTipoVehiculoDto } from './dto/actualizar-tipo-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';
import { ConsultarVehiculosDto } from './dto/consultar-vehiculos.dto';
import { CrearTipoVehiculoDto } from './dto/crear-tipo-vehiculo.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { VehiculosService } from './vehiculos.service';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get('vehicle-types')
  @Roles(roles.ADMIN, roles.OPERATOR, roles.DRIVER)
  listarTipos() {
    return this.vehiculosService.listarTipos();
  }

  @Post('vehicle-types')
  @Roles(roles.ADMIN, roles.OPERATOR)
  crearTipo(
    @Body() dto: CrearTipoVehiculoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.crearTipo(dto, actor.id, ip);
  }

  @Patch('vehicle-types/:id')
  @Roles(roles.ADMIN, roles.OPERATOR)
  actualizarTipo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarTipoVehiculoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.actualizarTipo(id, dto, actor.id, ip);
  }

  @Get('vehicles/statuses')
  @Roles(roles.ADMIN, roles.OPERATOR, roles.DRIVER)
  listarEstados() {
    return this.vehiculosService.listarEstados();
  }

  @Get('vehicles')
  @Roles(roles.ADMIN, roles.OPERATOR, roles.DRIVER)
  listar(@Query() query: ConsultarVehiculosDto) {
    return this.vehiculosService.listar(query);
  }

  @Get('vehicles/:id')
  @Roles(roles.ADMIN, roles.OPERATOR, roles.DRIVER)
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiculosService.obtener(id);
  }

  @Post('vehicles')
  @Roles(roles.ADMIN, roles.OPERATOR)
  crear(
    @Body() dto: CrearVehiculoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.crear(dto, actor.id, ip);
  }

  @Patch('vehicles/:id/status')
  @Roles(roles.ADMIN, roles.OPERATOR)
  actualizarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarEstadoVehiculoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.actualizarEstado(id, dto, actor.id, ip);
  }

  @Patch('vehicles/:id')
  @Roles(roles.ADMIN, roles.OPERATOR)
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarVehiculoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.vehiculosService.actualizar(id, dto, actor.id, ip);
  }
}

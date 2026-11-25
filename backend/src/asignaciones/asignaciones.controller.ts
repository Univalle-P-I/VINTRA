import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { roles } from '../common/enums/roles.enum';
import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';

/**
 * Asignación de conductor + vehículo a una programación de microruta (#93).
 *
 * Respuestas: 201 creada; 400 solicitud inválida o fecha que no corresponde al
 * día de la programación; 404 recurso inexistente; 409 recurso inhabilitado,
 * no disponible u ocupado (`details` indica el motivo por campo).
 */
@Controller('assignments')
@Roles(roles.ADMIN, roles.OPERATOR)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  crear(@Body() dto: CrearAsignacionDto) {
    return this.asignacionesService.crear(dto);
  }

  @Get()
  listar() {
    return this.asignacionesService.listar();
  }

  @Get(':id')
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.asignacionesService.obtener(id);
  }
}

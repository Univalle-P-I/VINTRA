import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BarriosService } from './barrios.service';

@ApiTags('Barrios')
@Controller('barrios')
export class BarriosController {
  constructor(private readonly barriosService: BarriosService) {}

  @Get()
  @ApiOkResponse({ description: 'Listado de barrios.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  listar() {
    return this.barriosService.listar();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de barrio.' })
  @ApiBadRequestResponse({ description: 'El identificador no es un UUID válido.' })
  @ApiNotFoundResponse({ description: 'Barrio no encontrado.' })
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.barriosService.obtener(id);
  }
}

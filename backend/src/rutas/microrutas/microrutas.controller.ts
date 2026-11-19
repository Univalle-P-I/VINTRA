import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutasService } from './microrutas.service';

@ApiTags('Microrutas')
@Controller('microrutas')
export class MicrorutasController {
  constructor(private readonly microrutasService: MicrorutasService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Microruta creada.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiNotFoundResponse({ description: 'Macroruta no encontrada.' })
  crear(@Body() dto: CrearMicrorutaDto) {
    return this.microrutasService.crear(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Listado de microrutas.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  listar() {
    return this.microrutasService.listar();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de microruta y barrios asociados.' })
  @ApiBadRequestResponse({ description: 'El identificador no es un UUID válido.' })
  @ApiNotFoundResponse({ description: 'Microruta no encontrada.' })
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.microrutasService.obtener(id);
  }

  @Post(':id/barrios')
  @ApiCreatedResponse({ description: 'Barrios asociados a la microruta.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiNotFoundResponse({ description: 'Microruta o barrio no encontrado.' })
  asociarBarrios(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AsociarBarriosDto,
  ) {
    return this.microrutasService.asociarBarrios(id, dto);
  }
}

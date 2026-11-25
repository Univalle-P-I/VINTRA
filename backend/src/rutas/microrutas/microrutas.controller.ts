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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorouteCreatedResponseDto } from './dto/microroute-created-response.dto';
import { MicrorouteDetailResponseDto } from './dto/microroute-detail-response.dto';
import { MicrorouteResponseDto } from './dto/microroute-response.dto';
import { MicrorutasService } from './microrutas.service';

@ApiTags('Microrutas')
@Controller('microrutas')
export class MicrorutasController {
  constructor(private readonly microrutasService: MicrorutasService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Microruta creada.',
    type: MicrorouteCreatedResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiConflictResponse({ description: 'El código de la microruta ya existe.' })
  @ApiNotFoundResponse({ description: 'Macroruta no encontrada.' })
  crear(@Body() dto: CrearMicrorutaDto) {
    return this.microrutasService.crear(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Listado de microrutas.',
    type: MicrorouteResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  listar() {
    return this.microrutasService.listar();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle de microruta y barrios asociados.',
    type: MicrorouteDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'El identificador no es un UUID válido.' })
  @ApiNotFoundResponse({ description: 'Microruta no encontrada.' })
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.microrutasService.obtener(id);
  }

  @Post(':id/barrios')
  @ApiCreatedResponse({
    description: 'Barrios asociados a la microruta.',
    type: MicrorouteDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiNotFoundResponse({ description: 'Microruta o barrio no encontrado.' })
  asociarBarrios(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AsociarBarriosDto,
  ) {
    return this.microrutasService.asociarBarrios(id, dto);
  }
}

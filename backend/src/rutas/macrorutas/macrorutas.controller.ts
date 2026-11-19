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
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { MacrorutasService } from './macrorutas.service';

@ApiTags('Macrorutas')
@Controller('macrorutas')
export class MacrorutasController {
  constructor(private readonly macrorutasService: MacrorutasService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Macroruta creada.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  crear(@Body() dto: CrearMacrorutaDto) {
    return this.macrorutasService.crear(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Listado de macrorutas.' })
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  listar() {
    return this.macrorutasService.listar();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de macroruta.' })
  @ApiBadRequestResponse({ description: 'El identificador no es un UUID válido.' })
  @ApiNotFoundResponse({ description: 'Macroruta no encontrada.' })
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.macrorutasService.obtener(id);
  }
}

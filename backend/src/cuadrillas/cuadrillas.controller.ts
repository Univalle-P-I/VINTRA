import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { ListCrewsQueryDto } from './dto/list-crews-query.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';

/**
 * Endpoints de cuadrillas (VIN-024, #76). Rechaza propiedades desconocidas en
 * el cuerpo y en los filtros, según docs/API_SPECIFICATION.md.
 * Sin autenticación ni permisos hasta que se aprueben #54, #70 y #71.
 */
@Controller('cuadrillas')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
  createCrew(@Body() dto: CreateCrewDto) {
    return this.cuadrillasService.createCrew(dto);
  }

  @Get()
  findCrews(@Query() query: ListCrewsQueryDto) {
    return this.cuadrillasService.findCrews(query);
  }

  @Get(':id')
  findCrew(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuadrillasService.findCrew(id);
  }

  @Patch(':id')
  updateCrew(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCrewDto,
  ) {
    return this.cuadrillasService.updateCrew(id, dto);
  }

  @Delete(':id')
  deactivateCrew(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuadrillasService.deactivateCrew(id);
  }
}

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
import { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { ListCrewMembersQueryDto } from './dto/list-crew-members-query.dto';
import { ListDriversQueryDto } from './dto/list-drivers-query.dto';
import { UpdateCrewMemberDto } from './dto/update-crew-member.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PersonalService } from './personal.service';

/**
 * Endpoints de personal (VIN-024, #76). Rechaza propiedades desconocidas en el
 * cuerpo y en los filtros, según docs/API_SPECIFICATION.md.
 * Sin autenticación ni permisos hasta que se aprueben #54, #70 y #71.
 */
@Controller('personal')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post('drivers')
  createDriver(@Body() dto: CreateDriverDto) {
    return this.personalService.createDriver(dto);
  }

  @Get('drivers')
  findDrivers(@Query() query: ListDriversQueryDto) {
    return this.personalService.findDrivers(query);
  }

  @Get('drivers/:id')
  findDriver(@Param('id', ParseUUIDPipe) id: string) {
    return this.personalService.findDriver(id);
  }

  @Patch('drivers/:id')
  updateDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.personalService.updateDriver(id, dto);
  }

  @Delete('drivers/:id')
  deactivateDriver(@Param('id', ParseUUIDPipe) id: string) {
    return this.personalService.deactivateDriver(id);
  }

  @Post('crew-members')
  createCrewMember(@Body() dto: CreateCrewMemberDto) {
    return this.personalService.createCrewMember(dto);
  }

  @Get('crew-members')
  findCrewMembers(@Query() query: ListCrewMembersQueryDto) {
    return this.personalService.findCrewMembers(query);
  }

  @Get('crew-members/:id')
  findCrewMember(@Param('id', ParseUUIDPipe) id: string) {
    return this.personalService.findCrewMember(id);
  }

  @Patch('crew-members/:id')
  updateCrewMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCrewMemberDto,
  ) {
    return this.personalService.updateCrewMember(id, dto);
  }

  @Delete('crew-members/:id')
  deactivateCrewMember(@Param('id', ParseUUIDPipe) id: string) {
    return this.personalService.deactivateCrewMember(id);
  }
}

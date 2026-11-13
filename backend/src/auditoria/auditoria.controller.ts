import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiEndpoint } from '../comun/swagger.decorator';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { Roles } from '../autenticacion/roles.decorator';
import { RolesGuard } from '../autenticacion/roles.guard';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { ConsultarAuditoriaDto } from './dto/consultar-auditoria.dto';
import { AuditoriaService, RecursoAuditoria } from './auditoria.service';

@Controller('api/v1/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
@ApiTags('Auditoría')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
@ApiForbiddenResponse({ description: 'Solo ADMIN puede consultar auditoría.' })
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get(':resource')
  @ApiParam({
    name: 'resource',
    enum: Object.values(RecursoAuditoria),
    description: 'Recurso cuyo registro de auditoría se consulta.',
  })
  @ApiEndpoint({
    summary: 'Consultar registros de auditoría',
    responseDescription:
      'Página de eventos; no incluye snapshots old_values/new_values.',
    responseShape: 'page',
    roles: [RolUsuario.ADMIN],
    errors: [400],
  })
  listar(
    @Param('resource', new ParseEnumPipe(RecursoAuditoria))
    resource: RecursoAuditoria,
    @Query() query: ConsultarAuditoriaDto,
  ) {
    return this.auditoriaService.listar(
      resource,
      query.page,
      query.limit,
    );
  }
}

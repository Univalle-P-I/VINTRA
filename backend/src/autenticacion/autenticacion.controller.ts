import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RespuestaInicioSesion } from './dto/respuesta-inicio-sesion.dto';
import { AutenticacionService } from './autenticacion.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuarioAutenticado } from './usuario-autenticado.decorator';
import type { AuthenticatedUser } from './authenticated-user';
import { ApiEndpoint } from '../comun/swagger.decorator';

@Controller('api/v1/auth')
@ApiTags('Autenticación')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: IniciarSesionDto })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas o cuenta no habilitada.',
  })
  @ApiEndpoint({
    summary: 'Iniciar sesión',
    responseDescription: 'JWT Bearer y duración del token en segundos.',
    responseSchema: {
      type: 'object',
      required: ['accessToken', 'tokenType', 'expiresIn'],
      properties: {
        accessToken: { type: 'string', example: '<jwt>' },
        tokenType: { type: 'string', enum: ['Bearer'], example: 'Bearer' },
        expiresIn: { type: 'integer', example: 900 },
      },
    },
    errors: [400],
  })
  login(
    @Body() dto: IniciarSesionDto,
    @Req() request: Request,
  ): Promise<RespuestaInicioSesion> {
    if (!request.ip) {
      throw new BadRequestException('No fue posible determinar la IP solicitante.');
    }

    return this.autenticacionService.login(dto, request.ip);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido o revocado.' })
  @ApiEndpoint({
    summary: 'Cerrar sesión',
    status: HttpStatus.NO_CONTENT,
    responseDescription: 'Sesión revocada; no devuelve cuerpo.',
    responseShape: 'none',
    errors: [400],
  })
  async logout(
    @UsuarioAutenticado() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    if (!request.ip) {
      throw new BadRequestException('No fue posible determinar la IP solicitante.');
    }

    await this.autenticacionService.logout(
      user.userId,
      user.sessionId,
      request.ip,
    );
  }
}

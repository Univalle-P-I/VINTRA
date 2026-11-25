import { Controller } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';

/**
 * Estructura inicial (#131): sin endpoints.
 * La captura y la consulta de posiciones GPS se implementan después.
 */
@Controller('seguimiento')
export class SeguimientoController {
  constructor(protected readonly seguimientoService: SeguimientoService) {}
}
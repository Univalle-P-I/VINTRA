import { Controller } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';

/**
 * Estructura inicial (#127): sin endpoints.
 * Los endpoints se implementan en VIN-024 (#76).
 */
@Controller('cuadrillas')
export class CuadrillasController {
  constructor(protected readonly cuadrillasService: CuadrillasService) {}
}

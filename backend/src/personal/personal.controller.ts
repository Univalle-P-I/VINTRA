import { Controller } from '@nestjs/common';
import { PersonalService } from './personal.service';

/**
 * Estructura inicial (#127): sin endpoints.
 * Los endpoints se implementan en VIN-024 (#76).
 */
@Controller('personal')
export class PersonalController {
  constructor(protected readonly personalService: PersonalService) {}
}

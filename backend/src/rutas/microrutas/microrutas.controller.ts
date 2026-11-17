import { Controller } from '@nestjs/common';
import { MicrorutasService } from './microrutas.service';

@Controller('microrutas')
export class MicrorutasController {
  constructor(private readonly microrutasService: MicrorutasService) {}
}

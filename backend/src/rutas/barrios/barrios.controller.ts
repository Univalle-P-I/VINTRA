import { Controller } from '@nestjs/common';
import { BarriosService } from './barrios.service';


@Controller('barrios')
export class BarriosController {
  constructor(private readonly barriosService: BarriosService) {}
}

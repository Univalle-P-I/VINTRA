import { Controller } from '@nestjs/common';
import { MacrorutasService } from './macrorutas.service';


@Controller('macrorutas')
export class MacrorutasController {
  constructor(private readonly macrorutasService: MacrorutasService) {}
}

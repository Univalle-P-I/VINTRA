import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from './comun/swagger.decorator';
import { AppService } from './app.service';

@Controller()
@ApiTags('Sistema')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Obtener mensaje del servicio',
    responseDescription: 'Mensaje básico que confirma que el backend responde.',
    responseSchema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}

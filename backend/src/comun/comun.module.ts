import { Global, Module } from '@nestjs/common';

import { ContextoAuditoriaService } from './contexto-auditoria.service';

@Global()
@Module({
  providers: [ContextoAuditoriaService],
  exports: [ContextoAuditoriaService],
})
export class ComunModule {}

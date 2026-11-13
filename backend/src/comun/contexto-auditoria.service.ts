import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ContextoAuditoriaService {
  constructor(private readonly dataSource: DataSource) {}

  ejecutar<T>(
    actorId: string | null,
    requestIp: string | null,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query("SELECT set_config('app.current_user_id', $1, true)", [
        actorId ?? '',
      ]);
      await manager.query("SELECT set_config('app.request_ip', $1, true)", [
        requestIp ?? '',
      ]);

      return operation(manager);
    });
  }
}

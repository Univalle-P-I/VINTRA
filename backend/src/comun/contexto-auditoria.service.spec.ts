import type { EntityManager } from 'typeorm';

import { ContextoAuditoriaService } from './contexto-auditoria.service';

describe('ContextoAuditoriaService', () => {
  it('sets actor and request IP transaction-locally before the operation', async () => {
    const manager = { query: jest.fn().mockResolvedValue(undefined) };
    const dataSource = {
      transaction: jest.fn(
        async (operation: (transactionManager: EntityManager) => Promise<unknown>) =>
          operation(manager as unknown as EntityManager),
      ),
    };
    const service = new ContextoAuditoriaService(dataSource as never);
    const operation = jest.fn().mockResolvedValue('saved');

    await expect(
      service.ejecutar(
        'f0836911-5b63-490c-88a2-9176b9b2b4a1',
        '192.0.2.10',
        operation,
      ),
    ).resolves.toBe('saved');

    expect(manager.query).toHaveBeenNthCalledWith(
      1,
      "SELECT set_config('app.current_user_id', $1, true)",
      ['f0836911-5b63-490c-88a2-9176b9b2b4a1'],
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      2,
      "SELECT set_config('app.request_ip', $1, true)",
      ['192.0.2.10'],
    );
    expect(operation).toHaveBeenCalledWith(manager);
  });
});

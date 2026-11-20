import type { EntityManager } from 'typeorm';

export function createManager(repositories: Map<Function, object>) {
  return {
    getRepository: jest.fn((entity: Function) => repositories.get(entity)),
  };
}

export function createAuditContext(manager: object) {
  return {
    ejecutar: jest.fn(
      async (
        _actorId: string,
        _requestIp: string,
        operation: (transactionManager: EntityManager) => Promise<unknown>,
      ) => operation(manager as unknown as EntityManager),
    ),
  };
}

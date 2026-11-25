import { randomUUID } from 'node:crypto';

type Identified = { id: string };

/**
 * Repositorio en memoria para pruebas unitarias: imita lo que hace PostgreSQL
 * (genera el id y las fechas al insertar y devuelve copias al leer) sin
 * necesitar una base de datos.
 */
export class InMemoryRepository<T extends Identified> {
  readonly rows: T[] = [];

  /** Si se define, `save` lanza este error (simula una violación de restricción). */
  failWith: unknown;

  create(data: Partial<T>): T {
    return { ...data } as T;
  }

  save(entity: T): Promise<T> {
    if (this.failWith) {
      return Promise.reject(this.failWith as Error);
    }
    const stored = { ...entity } as Record<string, unknown>;
    if (!stored.id) {
      const now = new Date();
      stored.id = randomUUID();
      stored.isActive = stored.isActive ?? true;
      stored.createdAt = now;
      stored.updatedAt = now;
      this.rows.push(stored as T);
    } else {
      const index = this.rows.findIndex((row) => row.id === stored.id);
      stored.updatedAt = new Date();
      this.rows[index] = stored as T;
    }
    return Promise.resolve({ ...stored } as T);
  }

  find(options?: { where?: Record<string, unknown> }): Promise<T[]> {
    const where = options?.where ?? {};
    const found = this.rows.filter((row) =>
      Object.entries(where).every(
        ([key, value]) => (row as Record<string, unknown>)[key] === value,
      ),
    );
    return Promise.resolve(found.map((row) => ({ ...row })));
  }

  findOneBy(where: Record<string, unknown>): Promise<T | null> {
    const found = this.rows.find((row) =>
      Object.entries(where).every(
        ([key, value]) => (row as Record<string, unknown>)[key] === value,
      ),
    );
    return Promise.resolve(found ? { ...found } : null);
  }
}

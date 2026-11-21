import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearAsignacionDto } from './crear-asignacion.dto';

const valido = {
  programacionId: '11111111-1111-4111-8111-111111111111',
  conductorId: '22222222-2222-4222-8222-222222222222',
  vehiculoId: '33333333-3333-4333-8333-333333333333',
  fecha: '2026-12-15',
};

async function errores(cuerpo: object) {
  return validate(plainToInstance(CrearAsignacionDto, cuerpo));
}

describe('CrearAsignacionDto', () => {
  it('acepta una solicitud válida', async () => {
    expect(await errores(valido)).toHaveLength(0);
  });

  it.each(['15/12/2026', '2026-13-40', '2026-12-15T10:00:00Z', ''])(
    'rechaza la fecha %p',
    async (fecha) => {
      const resultado = await errores({ ...valido, fecha });
      expect(resultado.map((e) => e.property)).toContain('fecha');
    },
  );

  it.each(['programacionId', 'conductorId', 'vehiculoId'])(
    'rechaza %s que no es UUID',
    async (campo) => {
      const resultado = await errores({ ...valido, [campo]: 'abc' });
      expect(resultado.map((e) => e.property)).toContain(campo);
    },
  );
});

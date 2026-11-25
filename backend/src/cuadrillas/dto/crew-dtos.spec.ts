import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCrewDto } from './create-crew.dto';
import { UpdateCrewDto } from './update-crew.dto';

async function invalidFields<T extends object>(
  type: new () => T,
  payload: Record<string, unknown>,
): Promise<string[]> {
  const errors = await validate(plainToInstance(type, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((error) => error.property).sort();
}

describe('UpdateCrewDto', () => {
  it('rechaza null en name e isActive', async () => {
    expect(await invalidFields(UpdateCrewDto, { name: null })).toEqual(['name']);
    expect(await invalidFields(UpdateCrewDto, { isActive: null })).toEqual([
      'isActive',
    ]);
  });

  it('acepta un cuerpo vacío y valores válidos', async () => {
    expect(await invalidFields(UpdateCrewDto, {})).toEqual([]);
    expect(
      await invalidFields(UpdateCrewDto, { name: 'Norte', isActive: false }),
    ).toEqual([]);
  });
});

describe('CreateCrewDto', () => {
  it('rechaza un nombre null o en blanco', async () => {
    expect(await invalidFields(CreateCrewDto, { name: null })).toEqual(['name']);
    expect(await invalidFields(CreateCrewDto, { name: '  ' })).toEqual(['name']);
  });
});

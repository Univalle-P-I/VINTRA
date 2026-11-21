import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCrewMemberDto } from './create-crew-member.dto';
import { CreateDriverDto } from './create-driver.dto';
import { UpdateCrewMemberDto } from './update-crew-member.dto';
import { UpdateDriverDto } from './update-driver.dto';

const USER_ID = '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const CREW_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

/** Devuelve los nombres de los campos que no pasan la validación. */
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

describe('UpdateDriverDto', () => {
  it('rechaza null en startedAt e isActive', async () => {
    expect(await invalidFields(UpdateDriverDto, { startedAt: null })).toEqual([
      'startedAt',
    ]);
    expect(await invalidFields(UpdateDriverDto, { isActive: null })).toEqual([
      'isActive',
    ]);
  });

  it('permite null solo en crewId y endedAt', async () => {
    expect(
      await invalidFields(UpdateDriverDto, { crewId: null, endedAt: null }),
    ).toEqual([]);
  });

  it('acepta un cuerpo vacío (no cambia nada)', async () => {
    expect(await invalidFields(UpdateDriverDto, {})).toEqual([]);
  });

  it.each([
    '2026-W47-5',
    '2026-11-19',
    '2026-11-19T08:00:00',
    '2026-02-30T08:00:00Z',
    1763539200,
  ])('rechaza la fecha %p en startedAt y endedAt', async (value) => {
    expect(
      await invalidFields(UpdateDriverDto, { startedAt: value, endedAt: value }),
    ).toEqual(['endedAt', 'startedAt']);
  });

  it('acepta fechas completas con zona horaria', async () => {
    expect(
      await invalidFields(UpdateDriverDto, {
        startedAt: '2026-11-19T08:00:00Z',
        endedAt: '2026-11-20T03:00:00-05:00',
      }),
    ).toEqual([]);
  });
});

describe('CreateDriverDto', () => {
  it('rechaza null en startedAt', async () => {
    expect(
      await invalidFields(CreateDriverDto, {
        userAccountId: USER_ID,
        startedAt: null,
      }),
    ).toEqual(['startedAt']);
  });

  it('acepta solo la cuenta de usuario y permite crewId null', async () => {
    expect(
      await invalidFields(CreateDriverDto, { userAccountId: USER_ID }),
    ).toEqual([]);
    expect(
      await invalidFields(CreateDriverDto, {
        userAccountId: USER_ID,
        crewId: null,
      }),
    ).toEqual([]);
  });

  it('rechaza una fecha sin zona horaria', async () => {
    expect(
      await invalidFields(CreateDriverDto, {
        userAccountId: USER_ID,
        startedAt: '2026-11-19T08:00:00',
      }),
    ).toEqual(['startedAt']);
  });
});

describe('UpdateCrewMemberDto', () => {
  it('rechaza null en fullName e isActive', async () => {
    expect(await invalidFields(UpdateCrewMemberDto, { fullName: null })).toEqual([
      'fullName',
    ]);
    expect(await invalidFields(UpdateCrewMemberDto, { isActive: null })).toEqual([
      'isActive',
    ]);
  });

  it('permite null en crewId', async () => {
    expect(await invalidFields(UpdateCrewMemberDto, { crewId: null })).toEqual([]);
    expect(await invalidFields(UpdateCrewMemberDto, { crewId: CREW_ID })).toEqual(
      [],
    );
  });
});

describe('CreateCrewMemberDto', () => {
  it('rechaza un nombre null o en blanco', async () => {
    expect(await invalidFields(CreateCrewMemberDto, { fullName: null })).toEqual([
      'fullName',
    ]);
    expect(await invalidFields(CreateCrewMemberDto, { fullName: '   ' })).toEqual([
      'fullName',
    ]);
  });
});

import { BadRequestException } from '@nestjs/common';
import {
  isIsoDateTimeWithZone,
  parseIsoDateTime,
} from './is-iso-date-time-with-zone';

describe('isIsoDateTimeWithZone', () => {
  it.each([
    '2026-11-19T08:00:00Z',
    '2026-11-19T03:00:00-05:00',
    '2026-11-19T08:00:00+00:00',
    '2026-11-19T08:00:00.123Z',
    '2028-02-29T23:59:59Z',
  ])('acepta %s', (value) => {
    expect(isIsoDateTimeWithZone(value)).toBe(true);
  });

  it.each([
    ['fecha por semana', '2026-W47-5'],
    ['solo la fecha', '2026-11-19'],
    ['hora sin zona', '2026-11-19T08:00:00'],
    ['desfase sin dos puntos', '2026-11-19T08:00:00+0500'],
    ['espacio en lugar de T', '2026-11-19 08:00:00Z'],
    ['sin segundos', '2026-11-19T08:00Z'],
    ['30 de febrero', '2026-02-30T08:00:00Z'],
    ['29 de febrero sin año bisiesto', '2027-02-29T08:00:00Z'],
    ['mes 13', '2026-13-01T08:00:00Z'],
    ['hora 24', '2026-11-19T24:00:00Z'],
    ['minuto 60', '2026-11-19T08:60:00Z'],
    ['segundo 60', '2026-11-19T08:00:60Z'],
    ['desfase de 25 horas', '2026-11-19T08:00:00+25:00'],
    ['texto libre', 'mañana'],
    ['cadena vacía', ''],
  ])('rechaza %s', (_description, value) => {
    expect(isIsoDateTimeWithZone(value)).toBe(false);
  });

  it.each([null, undefined, 123, true, {}, []])(
    'rechaza el valor que no es texto: %p',
    (value) => {
      expect(isIsoDateTimeWithZone(value)).toBe(false);
    },
  );
});

describe('parseIsoDateTime', () => {
  it('convierte a UTC respetando el desfase', () => {
    expect(parseIsoDateTime('2026-11-19T03:00:00-05:00').toISOString()).toBe(
      '2026-11-19T08:00:00.000Z',
    );
  });

  it('responde 400 con una fecha inválida o null', () => {
    expect(() => parseIsoDateTime('2026-W47-5')).toThrow(BadRequestException);
    expect(() => parseIsoDateTime(null)).toThrow(BadRequestException);
  });
});

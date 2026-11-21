import { construirVentana, diaIso } from './asignaciones.utils';

describe('diaIso', () => {
  it.each([
    ['2026-12-14', 1], // lunes
    ['2026-12-15', 2],
    ['2026-12-20', 7], // domingo
  ])('%s es el día %i', (fecha, esperado) => {
    expect(diaIso(fecha)).toBe(esperado);
  });
});

describe('construirVentana', () => {
  it('convierte horas locales (UTC-5) a UTC', () => {
    const { inicio, fin } = construirVentana(
      '2026-12-15',
      '06:00:00',
      '10:30:00',
    );

    expect(inicio.toISOString()).toBe('2026-12-15T11:00:00.000Z');
    expect(fin.toISOString()).toBe('2026-12-15T15:30:00.000Z');
  });

  it('acepta horas sin segundos o con fracción', () => {
    const { inicio, fin } = construirVentana(
      '2026-12-15',
      '06:00',
      '10:00:00.000000',
    );

    expect(inicio.toISOString()).toBe('2026-12-15T11:00:00.000Z');
    expect(fin.toISOString()).toBe('2026-12-15T15:00:00.000Z');
  });
});

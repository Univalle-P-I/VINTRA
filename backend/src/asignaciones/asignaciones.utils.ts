import { OFFSET_ZONA_HORARIA } from './asignaciones.constants';

/** Día ISO de una fecha YYYY-MM-DD: 1 = lunes … 7 = domingo. */
export function diaIso(fecha: string): number {
  const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay();
  return dia === 0 ? 7 : dia;
}

function normalizarHora(hora: string): string {
  // Postgres entrega TIME como "HH:MM:SS" (o "HH:MM:SS.ffffff").
  const [hhmmss] = hora.split('.');
  return hhmmss.length === 5 ? `${hhmmss}:00` : hhmmss;
}

/** Ventana [inicio, fin] en UTC a partir de la fecha y las horas locales. */
export function construirVentana(
  fecha: string,
  horaInicio: string,
  horaFin: string,
): { inicio: Date; fin: Date } {
  return {
    inicio: new Date(
      `${fecha}T${normalizarHora(horaInicio)}${OFFSET_ZONA_HORARIA}`,
    ),
    fin: new Date(`${fecha}T${normalizarHora(horaFin)}${OFFSET_ZONA_HORARIA}`),
  };
}

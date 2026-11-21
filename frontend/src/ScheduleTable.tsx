import { Badge, DataTable, EmptyState } from "./ui"
import type { Column } from "./ui"
import type { ScheduleEntry } from "./store-context"
import type { Microroute } from "./domain"
import { DAYS } from "./days"

export function ScheduleTable({ schedules, microroutes, emptyText }: { schedules: ScheduleEntry[]; microroutes: Microroute[]; emptyText: string }) {
  const nameOf = (id: string) => microroutes.find((m) => m.id === id)?.name ?? "Microrruta no encontrada"
  const columns: Column<ScheduleEntry>[] = [
    { header: "Horario", render: (s) => <strong>{s.name}</strong> },
    { header: "Microrruta", render: (s) => nameOf(s.microrouteId) },
    { header: "Días", render: (s) => s.days.map((d) => DAYS[d - 1].short).join(", ") },
    { header: "Horario de recolección", render: (s) => `${s.start} – ${s.end}` },
    { header: "Estado", render: (s) => <Badge tone={s.active ? "ok" : "neutral"}>{s.active ? "Activo" : "Inactivo"}</Badge> },
  ]
  return <DataTable caption="Horarios de recolección" columns={columns} rows={schedules} empty={<EmptyState title="No hay horarios para mostrar"><p>{emptyText}</p></EmptyState>} />
}

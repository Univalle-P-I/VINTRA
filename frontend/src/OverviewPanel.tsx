import { useState } from "react"
import { Badge, Button, EmptyState, Figure, PageHeading, Section } from "./ui"
import { useData } from "./store-context"
import { findConflicts } from "./conflicts"
import { localDateKey } from "./domain"
import type { Role } from "./domain"
import type { ScreenId } from "./navigation"
import ConnectionStatus from "./ConnectionStatus"

export default function OverviewPanel({ role, onNavigate }: { role: Role; onNavigate: (id: ScreenId) => void }) {
  const { vehicles, people, crews, microroutes, schedules, assignments } = useData()
  const [today] = useState(() => localDateKey())
  const conflicts = findConflicts(assignments).size
  const down = vehicles.filter((v) => v.status === "Mantenimiento" || v.status === "Inhabilitado").length
  const noSchedule = microroutes.filter((m) => !schedules.some((s) => s.microrouteId === m.id)).length

  const alerts = [
    conflicts > 0 && { text: `${conflicts} asignación(es) con cuadrilla o vehículo repetido`, go: "operations" as ScreenId, cta: "Revisar asignaciones" },
    down > 0 && { text: `${down} vehículo(s) en mantenimiento o inhabilitados`, go: "fleet" as ScreenId, cta: "Ver flota" },
    noSchedule > 0 && { text: `${noSchedule} microrruta(s) sin horario programado`, go: "routes" as ScreenId, cta: "Programar horarios" },
  ].filter(Boolean) as { text: string; go: ScreenId; cta: string }[]

  const empty = !vehicles.length && !people.length && !microroutes.length && !assignments.length
  const steps: { done: boolean; label: string; go: ScreenId; cta: string }[] = [
    { done: vehicles.length > 0, label: "Registrar los vehículos", go: "fleet", cta: "Ir a flota" },
    { done: people.length > 0, label: "Registrar personal y crear cuadrillas", go: "people", cta: "Ir a personal" },
    { done: microroutes.length > 0, label: "Definir macrorrutas y microrrutas", go: "routes", cta: "Ir a rutas" },
    { done: assignments.length > 0, label: "Crear la primera asignación", go: "operations", cta: "Ir a operación" },
  ]

  return <>
    <PageHeading
      title="Resumen"
      description={role === "admin" ? "Qué está pasando en la operación y qué necesita tu atención." : "Estado de la operación del día y asignaciones por revisar."}
    />

    <div className="figures">
      <Figure lead label="Asignaciones de hoy" value={assignments.filter((a) => a.startAt.slice(0, 10) === today).length} />
      <Figure label="Vehículos disponibles" value={vehicles.filter((v) => v.isActive && v.status === "Disponible").length} note={`de ${vehicles.length} registrados`} />
      <Figure label="Cuadrillas" value={crews.length} />
      <Figure label="Microrrutas" value={microroutes.length} />
    </div>

    {alerts.length > 0 ? (
      <Section title="Requiere atención">
        {alerts.map((a) => (
          <div className="attention" key={a.text}>
            <strong>{a.text}</strong>
            <Button onClick={() => onNavigate(a.go)}>{a.cta}</Button>
          </div>
        ))}
      </Section>
    ) : !empty ? (
      <div className="attention attention--ok"><strong>Sin novedades por ahora</strong>No hay conflictos, vehículos detenidos ni rutas sin horario.</div>
    ) : null}

    {empty && (
      <Section title="Para empezar" subtitle="Sigue este orden: cada paso habilita el siguiente.">
        <div className="panel">
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                {s.done ? <Badge tone="ok">Hecho</Badge> : <Button onClick={() => onNavigate(s.go)}>{s.cta}</Button>}
              </li>
            ))}
          </ol>
        </div>
      </Section>
    )}

    {role === "admin" && (
      <Section title="Estado del sistema" subtitle="Comunicación entre la aplicación, la API y la base de datos.">
        <ConnectionStatus />
      </Section>
    )}
    {!alerts.length && empty && role !== "admin" && <EmptyState title="Aún no hay datos operativos" />}
  </>
}

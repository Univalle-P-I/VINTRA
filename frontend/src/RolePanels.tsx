import { useMemo, useState } from "react"
import { EmptyState, Field, PageHeading, Section } from "./ui"
import { ScheduleTable } from "./ScheduleTable"
import { useData } from "./store-context"
import MapView from "./MapView"

/** Vista de mapa a pantalla completa para administración y jefatura. */
export function MapPage() {
  return <>
    <PageHeading title="Mapa" description="Territorio de Buenaventura con las rutas y posiciones registradas." />
    <MapView label="Mapa operativo de Buenaventura" />
  </>
}

/** Conductor: solo lo necesario para ejecutar su recorrido. */
export function DriverPanel() {
  return <>
    <PageHeading title="Mi recorrido" description="Tu asignación de hoy: microrruta, horario y vehículo." />
    <Section title="Asignación de hoy">
      <EmptyState title="No se encontró una asignación para hoy">
        <p>Cuando el jefe de operaciones te asigne una microrruta, aquí verás la cuadrilla, el vehículo y el horario. Si esperabas una asignación, consúltalo con tu jefe de operaciones.</p>
      </EmptyState>
    </Section>
    <Section title="Mi microrruta en el mapa">
      <MapView label="Mapa de mi recorrido en Buenaventura" />
    </Section>
  </>
}

/** Ciudadano: consulta de rutas y horarios, sin información administrativa. */
export function CitizenPanel() {
  const { schedules, microroutes } = useData()
  const [q, setQ] = useState("")
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return schedules
    return schedules.filter((s) => (microroutes.find((m) => m.id === s.microrouteId)?.name ?? "").toLowerCase().includes(term) || s.name.toLowerCase().includes(term))
  }, [q, schedules, microroutes])

  return <>
    <PageHeading title="Rutas y horarios" description="Consulta qué días y a qué hora pasa el servicio de recolección por tu sector." />
    <div className="filters"><Field label="Buscar tu ruta" value={q} onChange={setQ} placeholder="Nombre de la ruta" /></div>
    <Section title="Horarios de recolección">
      <ScheduleTable schedules={shown} microroutes={microroutes} emptyText={q ? "No encontramos rutas con ese nombre. Prueba con otra palabra." : "Todavía no hay horarios publicados. Vuelve a consultar más adelante."} />
    </Section>
    <Section title="Sectores atendidos" subtitle="Mapa de Buenaventura con las rutas de recolección.">
      <MapView label="Mapa de rutas de recolección en Buenaventura" />
    </Section>
  </>
}

import { FormEvent, useMemo, useState } from "react"
import { Badge, Button, DataTable, EmptyState, Field, Figure, Modal, PageHeading, Section, SelectField } from "./ui"
import type { Column } from "./ui"
import { localDateKey } from "./domain"
import type { Assignment } from "./domain"
import { useData } from "./store-context"
import { useToast } from "./useToast"
import MapView from "./MapView"
import { assignmentConflict, findConflicts } from "./conflicts"

const fmt = (iso: string) => new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
const blank = { crew: "", microroute: "", vehicle: "", startAt: "", endAt: "" }

export default function OperationsPanel({ canManage = true }: { canManage?: boolean }) {
  const { assignments, crews, microroutes, vehicles, add } = useData()
  const [filters, setFilters] = useState({ date: "", crew: "Todas", vehicle: "Todos", microroute: "Todas" })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(blank)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { show, toast } = useToast()

  const conflicts = useMemo(() => findConflicts(assignments), [assignments])
  const usable = vehicles.filter((v) => v.isActive && (v.status === "Disponible" || v.status === "En operación"))
  const rows = useMemo(() => assignments.filter((a) =>
    (!filters.date || a.startAt.slice(0, 10) === filters.date) &&
    (filters.crew === "Todas" || a.crew === filters.crew) &&
    (filters.vehicle === "Todos" || a.vehicle === filters.vehicle) &&
    (filters.microroute === "Todas" || a.microroute === filters.microroute)
  ), [assignments, filters])

  const [today] = useState(() => localDateKey())
  const canCreate = crews.length > 0 && microroutes.length > 0 && usable.length > 0
  const set = (k: keyof typeof filters) => (v: string) => setFilters((f) => ({ ...f, [k]: v }))
  const close = () => { setOpen(false); setDraft(blank); setErrors({}) }
  const openForm = () => setOpen(true) as void

  function save(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!draft.crew) next.crew = "Selecciona una cuadrilla."
    if (!draft.microroute) next.microroute = "Selecciona una microrruta."
    if (!draft.vehicle) next.vehicle = "Selecciona un vehículo."
    if (!draft.startAt) next.startAt = "Indica cuándo inicia."
    if (!draft.endAt) next.endAt = "Indica cuándo termina."
    else if (draft.startAt && draft.endAt <= draft.startAt) next.endAt = "El fin debe ser posterior al inicio."
    setErrors(next)
    if (Object.keys(next).length) return
    const conflict = assignmentConflict(draft, assignments)
    if (conflict) {
      setErrors({ conflict: `No se puede guardar: ${conflict.toLowerCase()} en el horario seleccionado.` })
      return
    }
    add.assignment(draft); close(); show("Asignación guardada.")
  }

  const columns: Column<Assignment>[] = [
    { header: "Microrruta", render: (a) => <strong>{a.microroute}</strong> },
    { header: "Cuadrilla", render: (a) => a.crew },
    { header: "Vehículo", render: (a) => a.vehicle },
    { header: "Inicio", render: (a) => fmt(a.startAt) },
    { header: "Fin", render: (a) => fmt(a.endAt) },
    { header: "Revisión", render: (a) => conflicts.has(a.id) ? <Badge tone="warn">{conflicts.get(a.id)}</Badge> : <Badge tone="ok">Sin conflictos</Badge> },
  ]

  const blocker = !crews.length ? "Crea una cuadrilla en Gestión de personal." : !microroutes.length ? "Crea una microrruta en Gestión de rutas." : !usable.length ? "Registra un vehículo activo y disponible en Gestión de flota." : ""

  return <>
    <PageHeading
      title="Gestión de operación"
      description="Cada asignación une una cuadrilla, una microrruta y un vehículo en una fecha y hora."
      action={canManage ? <Button disabled={!canCreate} icon="plus" primary onClick={openForm}>Nueva asignación</Button> : undefined}
    />
    {canManage && blocker && <div className="attention"><strong>Antes de asignar</strong>{blocker}</div>}

    <div className="figures">
      <Figure lead label="Asignaciones de hoy" value={assignments.filter((a) => a.startAt.slice(0, 10) === today).length} />
      <Figure label="Asignaciones registradas" value={assignments.length} />
      <Figure label="Con conflictos" value={conflicts.size} note={conflicts.size ? "Revisa los horarios repetidos" : undefined} />
    </div>

    <Section title="Asignaciones">
      <div className="filters">
        <Field label="Fecha" type="date" value={filters.date} onChange={set("date")} />
        <SelectField label="Cuadrilla" value={filters.crew} onChange={set("crew")}><option>Todas</option>{crews.map((c) => <option key={c.id}>{c.name}</option>)}</SelectField>
        <SelectField label="Vehículo" value={filters.vehicle} onChange={set("vehicle")}><option>Todos</option>{vehicles.map((v) => <option key={v.id}>{v.plate}</option>)}</SelectField>
        <SelectField label="Microrruta" value={filters.microroute} onChange={set("microroute")}><option>Todas</option>{microroutes.map((m) => <option key={m.id}>{m.name}</option>)}</SelectField>
      </div>
      <DataTable caption="Asignaciones de operación" columns={columns} rows={rows} empty={
        <EmptyState title={assignments.length ? "Ninguna asignación coincide con los filtros" : "Todavía no hay asignaciones"}>
          <p>{assignments.length ? "Cambia o limpia los filtros para ver más resultados." : "Las asignaciones aparecerán aquí cuando se creen o se consulten desde el sistema."}</p>
        </EmptyState>} />
    </Section>

    <Section title="Seguimiento en el mapa" subtitle="Cada posición pertenece a una asignación; la API puede mostrar su vehículo y microrruta asociados.">
      <MapView label="Mapa de seguimiento de Buenaventura" />
    </Section>

    {open && (
      <Modal title="Nueva asignación" onClose={close}>
        <form noValidate onSubmit={save}>
          <div className="form-grid">
          <SelectField error={errors.crew} label="Cuadrilla" required value={draft.crew} onChange={(v) => setDraft((d) => ({ ...d, crew: v }))}><option value="">Seleccionar</option>{crews.map((c) => <option key={c.id}>{c.name}</option>)}</SelectField>
          <SelectField error={errors.microroute} label="Microrruta" required value={draft.microroute} onChange={(v) => setDraft((d) => ({ ...d, microroute: v }))}><option value="">Seleccionar</option>{microroutes.map((m) => <option key={m.id}>{m.name}</option>)}</SelectField>
          <SelectField error={errors.vehicle} label="Vehículo" required value={draft.vehicle} onChange={(v) => setDraft((d) => ({ ...d, vehicle: v }))}><option value="">Seleccionar</option>{usable.map((v) => <option key={v.id}>{v.plate}</option>)}</SelectField>
            <span />
          <Field label="Inicio" required type="datetime-local" value={draft.startAt} onChange={(v) => setDraft((d) => ({ ...d, startAt: v }))} error={errors.startAt} />
          <Field label="Fin" required type="datetime-local" value={draft.endAt} onChange={(v) => setDraft((d) => ({ ...d, endAt: v }))} error={errors.endAt} />
          </div>
        {errors.conflict && <p className="form-alert" role="alert" style={{ marginTop: 12 }}>{errors.conflict}</p>}
          <p className="muted" style={{ marginTop: 12 }}>Solo se listan vehículos activos con estado Disponible o En operación.</p>
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Guardar asignación</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>)}
    {toast}
  </>
}

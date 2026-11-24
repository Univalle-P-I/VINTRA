import { FormEvent, useState } from "react"
import { Badge, Button, DataTable, EmptyState, Field, Figure, Modal, PageHeading, Section, SelectField } from "./ui"
import type { Column } from "./ui"
import type { Macroroute } from "./domain"
import { useData } from "./store-context"
import { useToast } from "./useToast"
import { ScheduleTable } from "./ScheduleTable"
import { DAYS } from "./days"
import MapView from "./MapView"

type ModalKind = "macro" | "micro" | "schedule" | null

export default function RoutePanel({ canManage = true }: { canManage?: boolean }) {
  const { macroroutes, microroutes, schedules, add } = useData()
  const [modal, setModal] = useState<ModalKind>(null)
  const [name, setName] = useState("")
  const [parent, setParent] = useState("")
  const [micro, setMicro] = useState("")
  const [start, setStart] = useState("06:00")
  const [end, setEnd] = useState("10:00")
  const [days, setDays] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { show, toast } = useToast()

  const close = () => { setModal(null); setName(""); setParent(""); setMicro(""); setDays([]); setErrors({}) }
  const open = (k: ModalKind) => { setParent(macroroutes[0]?.id ?? ""); setMicro(microroutes[0]?.id ?? ""); setModal(k) }

  function saveMacro(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setErrors({ name: "Escribe el nombre de la macrorruta." })
    if (macroroutes.some((m) => m.name.toLowerCase() === name.trim().toLowerCase())) return setErrors({ name: "Ya existe una macrorruta con ese nombre." })
    add.macroroute(name.trim()); show(`Macrorruta ${name.trim()} creada.`); close()
  }
  function saveMicro(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setErrors({ name: "Escribe el nombre de la microrruta." })
    if (!parent) return setErrors({ parent: "Selecciona una macrorruta." })
    if (microroutes.some((m) => m.macrorouteId === parent && m.name.toLowerCase() === name.trim().toLowerCase())) return setErrors({ name: "Esa macrorruta ya tiene una microrruta con ese nombre." })
    add.microroute({ name: name.trim(), macrorouteId: parent }); show(`Microrruta ${name.trim()} creada.`); close()
  }
  function saveSchedule(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = "Escribe un nombre para el horario."
    if (!micro) next.micro = "Selecciona una microrruta."
    if (!start || !end || end <= start) next.time = "La hora de finalización debe ser posterior a la de inicio."
    if (!days.length) next.days = "Selecciona al menos un día."
    setErrors(next)
    if (Object.keys(next).length) return
    add.schedule({ name: name.trim(), start, end, microrouteId: micro, days: [...days].sort() }); show(`Horario ${name.trim()} guardado.`); close()
  }

  const macroColumns: Column<Macroroute>[] = [
    { header: "Macrorruta", render: (m) => <strong>{m.name}</strong> },
    { header: "Microrrutas", render: (m) => microroutes.filter((x) => x.macrorouteId === m.id).map((x) => x.name).join(", ") || "Sin microrrutas" },
    { header: "Estado", render: (m) => <Badge tone={m.isActive ? "ok" : "neutral"}>{m.isActive ? "Activa" : "Inactiva"}</Badge> },
  ]

  return <>
    <PageHeading
      title="Gestión de rutas"
      description="Organiza las macrorrutas, las microrrutas que las componen y los horarios en que se recolecta."
      action={canManage ? (
        <div className="actions">
          <Button icon="plus" primary onClick={() => open("macro")}>Nueva macrorruta</Button>
          <Button disabled={!macroroutes.length} onClick={() => open("micro")}>Nueva microrruta</Button>
          <Button disabled={!microroutes.length} onClick={() => open("schedule")}>Programar horario</Button>
        </div>) : undefined}
    />
    <div className="figures">
      <Figure lead label="Macrorrutas" value={macroroutes.length} />
      <Figure label="Microrrutas" value={microroutes.length} />
      <Figure label="Horarios programados" value={schedules.length} />
    </div>

    <Section title="Mapa de cobertura" subtitle="Cartografía de OpenStreetMap. Las rutas se dibujan cuando el sistema entregue sus geometrías.">
      <MapView label="Mapa de rutas de Buenaventura" />
    </Section>

    <div className="split">
      <Section title="Macrorrutas y microrrutas" subtitle="Cada microrruta pertenece a una macrorruta.">
        <DataTable caption="Macrorrutas" columns={macroColumns} rows={macroroutes} empty={
          <EmptyState title="Todavía no hay macrorrutas" action={canManage ? <Button primary onClick={() => open("macro")}>Crear la primera macrorruta</Button> : undefined}>
            <p>Una macrorruta agrupa las microrrutas de una zona de la ciudad.</p>
          </EmptyState>} />
      </Section>
      <Section title="Barrios atendidos" subtitle="Barrios de cada microrruta, en su orden de visita.">
        <EmptyState title="Sin barrios asociados">
          <p>Esta lista se completa con la relación entre microrrutas y barrios. Aún no hay información disponible para mostrar.</p>
        </EmptyState>
      </Section>
    </div>

    <Section title="Horarios de recolección" subtitle="Días y horas en que cada microrruta presta el servicio.">
      <ScheduleTable schedules={schedules} microroutes={microroutes} emptyText={microroutes.length ? "Programa un horario para una microrruta." : "Crea una microrruta para poder programar su horario."} />
    </Section>

    {modal === "macro" && (
      <Modal title="Nueva macrorruta" onClose={close}>
        <form noValidate onSubmit={saveMacro}>
          <Field label="Nombre" value={name} onChange={setName} error={errors.name} required />
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Crear macrorruta</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>)}
    {modal === "micro" && (
      <Modal title="Nueva microrruta" onClose={close}>
        <form noValidate onSubmit={saveMicro}>
          <div className="form-grid">
            <Field label="Nombre" value={name} onChange={setName} error={errors.name} required />
            <SelectField error={errors.parent} label="Macrorruta" required value={parent} onChange={setParent}><option value="">Seleccionar</option>{macroroutes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</SelectField>
          </div>
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Crear microrruta</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>)}
    {modal === "schedule" && (
      <Modal title="Programar horario" onClose={close}>
        <form noValidate onSubmit={saveSchedule}>
          <div className="form-grid">
            <Field label="Nombre del horario" value={name} onChange={setName} error={errors.name} placeholder="Ej.: Recolección de mañana" required />
            <SelectField error={errors.micro} label="Microrruta" required value={micro} onChange={setMicro}><option value="">Seleccionar</option>{microroutes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</SelectField>
            <Field label="Hora de inicio" required type="time" value={start} onChange={setStart} />
            <Field label="Hora de finalización" required type="time" value={end} onChange={setEnd} error={errors.time} />
          </div>
          <fieldset style={{ border: 0, margin: "16px 0 0", padding: 0 }}>
            <legend style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Días de la semana</legend>
            <div className="filters" style={{ marginTop: 6 }}>
              {DAYS.map((d) => (
                <label className="map-toggle" key={d.n}>
                  <input checked={days.includes(d.n)} onChange={(e) => setDays((c) => e.target.checked ? [...c, d.n] : c.filter((x) => x !== d.n))} type="checkbox" />{d.short}
                </label>))}
            </div>
            {errors.days && <span style={{ color: "var(--danger)", fontSize: "var(--text-xs)" }}>{errors.days}</span>}
          </fieldset>
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Guardar horario</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>)}
    {toast}
  </>
}

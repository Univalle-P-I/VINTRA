import { FormEvent, useMemo, useState } from "react"
import { Badge, Button, DataTable, EmptyState, Field, Modal, PageHeading, Section, SelectField, Figure } from "./ui"
import type { Column } from "./ui"
import { VEHICLE_STATUSES, VEHICLE_TYPES, normalizePlate } from "./domain"
import type { Vehicle, VehicleStatusName } from "./domain"
import { useData } from "./store-context"
import { useToast } from "./useToast"

const TONE: Record<VehicleStatusName, "ok" | "info" | "warn" | "danger"> = {
  Disponible: "ok", "En operación": "info", Mantenimiento: "warn", Inhabilitado: "danger",
}
const toNumber = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")))
const blank = { plate: "", type: VEHICLE_TYPES[0] as string, status: "Disponible" as VehicleStatusName, kg: "", yd3: "", active: "Sí" }

export default function FleetPanel({ canManage = true }: { canManage?: boolean }) {
  const { vehicles, add } = useData()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(blank)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { show, toast } = useToast()

  const filtered = useMemo(() => vehicles.filter((v) => {
    const q = search.trim().toLowerCase()
    return (!q || v.plate.toLowerCase().includes(q)) && (statusFilter === "Todos" || v.status === statusFilter)
  }), [vehicles, search, statusFilter])

  const count = (s: VehicleStatusName) => vehicles.filter((v) => v.status === s).length

  function close() { setOpen(false); setDraft(blank); setErrors({}) }

  function save(event: FormEvent) {
    event.preventDefault()
    const plate = normalizePlate(draft.plate)
    const next: Record<string, string> = {}
    const kg = toNumber(draft.kg), yd3 = toNumber(draft.yd3)
    if (!plate) next.plate = "Escribe la placa del vehículo."
    else if (vehicles.some((v) => normalizePlate(v.plate) === plate)) next.plate = "La placa ya está registrada."
    if (kg !== null && (!Number.isFinite(kg) || kg <= 0)) next.kg = "Indica una capacidad en kg mayor que cero."
    if (yd3 !== null && (!Number.isFinite(yd3) || yd3 <= 0)) next.yd3 = "Indica una capacidad en yd³ mayor que cero."
    setErrors(next)
    if (Object.keys(next).length) return
    add.vehicle({ plate, type: draft.type, status: draft.status, capacityKg: kg, capacityYd3: yd3, isActive: draft.active === "Sí" })
    close()
    show(`Vehículo ${plate} registrado.`)
  }

  const columns: Column<Vehicle>[] = [
    { header: "Placa", render: (v) => <strong>{v.plate}</strong> },
    { header: "Tipo", render: (v) => v.type },
    { header: "Capacidad", render: (v) => [v.capacityKg !== null && `${v.capacityKg} kg`, v.capacityYd3 !== null && `${v.capacityYd3} yd³`].filter(Boolean).join(" · ") || "Sin dato" },
    { header: "Estado operativo", render: (v) => <Badge tone={TONE[v.status]}>{v.status}</Badge> },
    { header: "Registro", render: (v) => <Badge tone={v.isActive ? "ok" : "neutral"}>{v.isActive ? "Activo" : "Inactivo"}</Badge> },
  ]

  return <>
    <PageHeading
      title="Gestión de flota"
      description="Consulta qué vehículos tiene el servicio, de qué tipo son, cuánto pueden cargar y en qué estado están."
      action={canManage ? <Button icon="plus" primary onClick={() => setOpen(true)}>Registrar vehículo</Button> : undefined}
    />

    <div className="figures">
      <Figure lead label="Vehículos registrados" value={vehicles.length} />
      <Figure label="Disponibles" value={count("Disponible")} />
      <Figure label="En operación" value={count("En operación")} />
      <Figure label="Mantenimiento o inhabilitados" value={count("Mantenimiento") + count("Inhabilitado")} />
    </div>

    <Section title="Inventario">
      <div className="filters">
        <Field label="Buscar" value={search} onChange={setSearch} placeholder="Placa" />
        <SelectField label="Estado operativo" value={statusFilter} onChange={setStatusFilter}>
          <option>Todos</option>{VEHICLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </SelectField>
      </div>
      <DataTable
        caption="Vehículos registrados"
        columns={columns}
        rows={filtered}
        empty={
          <EmptyState
            title={vehicles.length ? "Ningún vehículo coincide con el filtro" : "Todavía no hay vehículos registrados"}
            action={canManage && !vehicles.length ? <Button primary onClick={() => setOpen(true)}>Registrar el primer vehículo</Button> : undefined}
          >
            <p>{vehicles.length ? "Prueba con otra placa o quita el filtro de estado." : "Los vehículos aparecerán aquí cuando se registren o se consulten desde el sistema."}</p>
          </EmptyState>
        }
      />
    </Section>

    {open && (
      <Modal title="Registrar vehículo" onClose={close}>
        <form noValidate onSubmit={save}>
          <div className="form-grid">
            <Field label="Placa" value={draft.plate} onChange={(v) => setDraft((d) => ({ ...d, plate: v }))} error={errors.plate} hint="Se guarda en mayúsculas y sin espacios." required />
            <SelectField label="Tipo de vehículo" value={draft.type} onChange={(v) => setDraft((d) => ({ ...d, type: v }))} required>
              {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </SelectField>
            <Field label="Capacidad (kg)" inputMode="decimal" value={draft.kg} onChange={(v) => setDraft((d) => ({ ...d, kg: v }))} error={errors.kg} />
            <Field label="Capacidad (yd³)" inputMode="decimal" value={draft.yd3} onChange={(v) => setDraft((d) => ({ ...d, yd3: v }))} error={errors.yd3} />
            <SelectField label="Estado operativo" value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v as VehicleStatusName }))} required>
              {VEHICLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </SelectField>
            <SelectField label="Registro activo" value={draft.active} onChange={(v) => setDraft((d) => ({ ...d, active: v }))} required>
              <option>Sí</option><option>No</option>
            </SelectField>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>El estado operativo describe qué hace el vehículo hoy; “Registro activo” indica si sigue en uso en el sistema.</p>
          <div className="actions" style={{ marginTop: 16 }}>
            <Button primary type="submit">Guardar vehículo</Button>
            <Button onClick={close}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    )}
    {toast}
  </>
}

import { FormEvent, useMemo, useState } from "react"
import { Button, Field, SelectField, PageHeading, Metric, Section, Footer } from "./ui"

type VehicleStatus = "Disponible" | "En operación" | "Mantenimiento" | "Inhabilitado"
type Vehicle = { id: string; plate: string; type: string; capacity: string; model: string; year: string; fuel: string; status: VehicleStatus; driver: string }

const emptyVehicle: Vehicle = { id: "", plate: "", type: "Compactador", capacity: "", model: "", year: "", fuel: "", status: "Disponible", driver: "" }

const normalizePlate = (plate: string) => plate.replace(/\s/g, "").toUpperCase()

export default function FleetPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [draft, setDraft] = useState<Vehicle>(emptyVehicle)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [message, setMessage] = useState("")
  const filtered = useMemo(() => vehicles.filter(v => {
    const q = search.trim().toLowerCase()
    return (!q || [v.id, v.plate, v.model].some(x => x.toLowerCase().includes(q))) &&
      (statusFilter === "Todos" || v.status === statusFilter)
  }), [vehicles, search, statusFilter])

  function save(event: FormEvent) {
    event.preventDefault()
    const plate = normalizePlate(draft.plate)
    if (!plate || !draft.model.trim()) {
      setMessage("Completa la placa y el modelo.")
      return
    }
    if (vehicles.some(v => normalizePlate(v.plate) === plate)) {
      setMessage("La placa ya está registrada.")
      return
    }
    setVehicles(current => [...current, { ...draft, plate, id: draft.id || crypto.randomUUID() }])
    setDraft(emptyVehicle)
    setMessage("Vehículo agregado a la lista local. La persistencia requiere conexión con el backend.")
  }

  return <main className="content">
    <PageHeading title="Gestión de flota" description="Administra el inventario, las características y la disponibilidad de los vehículos." />
    <div className="metrics">
      <Metric label="Vehículos registrados" value={vehicles.length} detail="Registros cargados en esta sesión" />
      <Metric label="Disponibles" value={vehicles.filter(v => v.status === "Disponible").length} detail="Según los registros cargados" />
      <Metric label="En operación" value={vehicles.filter(v => v.status === "En operación").length} detail="Según los registros cargados" />
      <Metric label="En mantenimiento" value={vehicles.filter(v => v.status === "Mantenimiento").length} detail="Según los registros cargados" />
    </div>
    <Section title="Inventario de vehículos" subtitle="Los registros aparecerán aquí cuando se agreguen o se consulten desde el backend.">
      <div className="filters">
        <Field label="Buscar" value={search} onChange={setSearch} placeholder="Placa, código o modelo" />
        <SelectField label="Estado" value={statusFilter} onChange={setStatusFilter}>
          <option>Todos</option><option>Disponible</option><option>En operación</option><option>Mantenimiento</option><option>Inhabilitado</option>
        </SelectField>
      </div>
      <div className="data-table responsive-table fleet-table">
        <div className="table-row table-head"><span>Código</span><span>Placa</span><span>Tipo</span><span>Modelo</span><span>Estado</span></div>
        {filtered.length ? filtered.map(v => <div className="table-row" key={v.id}><span data-label="Código">{v.id}</span><span data-label="Placa">{v.plate}</span><span data-label="Tipo">{v.type}</span><span data-label="Modelo">{v.model}</span><span data-label="Estado">{v.status}</span></div>) : <p className="empty-state">No hay vehículos registrados para mostrar.</p>}
      </div>
    </Section>
    <Section title="Registrar vehículo" subtitle="Completa los datos del vehículo. Al guardar, el registro se conserva únicamente en el estado local de esta pantalla.">
      <form className="assignment-form" onSubmit={save}>
        <div className="assignment-grid">
          <Field label="Placa" value={draft.plate} onChange={v => setDraft(d => ({...d, plate:v}))} />
          <Field label="Marca / modelo" value={draft.model} onChange={v => setDraft(d => ({...d, model:v}))} />
          <Field label="Capacidad" value={draft.capacity} onChange={v => setDraft(d => ({...d, capacity:v}))} />
          <Field label="Año" value={draft.year} onChange={v => setDraft(d => ({...d, year:v}))} />
          <SelectField label="Tipo" value={draft.type} onChange={v => setDraft(d => ({...d, type:v}))}><option>Compactador</option><option>Volqueta</option><option>Camión</option><option>Otro</option></SelectField>
          <SelectField label="Combustible" value={draft.fuel} onChange={v => setDraft(d => ({...d, fuel:v}))}><option value="">Seleccionar</option><option>Diésel</option><option>Gasolina</option><option>Gas</option><option>Eléctrico</option></SelectField>
          <SelectField label="Estado" value={draft.status} onChange={v => setDraft(d => ({...d, status:v as VehicleStatus}))}><option>Disponible</option><option>En operación</option><option>Mantenimiento</option><option>Inhabilitado</option></SelectField>
          <Field label="Conductor asignado" value={draft.driver} onChange={v => setDraft(d => ({...d, driver:v}))} />
        </div>
        {message && <p className="form-message" role="status">{message}</p>}
        <div className="actions"><Button primary type="submit">Guardar vehículo</Button><Button onClick={() => {setDraft(emptyVehicle);setMessage("")}}>Limpiar</Button></div>
      </form>
    </Section>
    <Footer />
  </main>
}

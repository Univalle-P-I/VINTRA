import { FormEvent, useMemo, useState } from "react"
import { Badge, Button, DataTable, EmptyState, Field, Modal, PageHeading, Section, SelectField, Figure } from "./ui"
import type { Column } from "./ui"
import type { Person } from "./domain"
import { useData } from "./store-context"
import { useToast } from "./useToast"
import type { Crew } from "./store-context"

const ROLES: Person["role"][] = ["Administrador", "Jefe de operaciones", "Conductor"]
const blank = { name: "", document: "", phone: "", role: "Conductor" as Person["role"], active: "Activa" }

export default function PeoplePanel({ canManage = true }: { canManage?: boolean }) {
  const { people, crews, add } = useData()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [modal, setModal] = useState<"person" | "crew" | null>(null)
  const [draft, setDraft] = useState(blank)
  const [crewName, setCrewName] = useState("")
  const [members, setMembers] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { show, toast } = useToast()

  const filtered = useMemo(() => people.filter((p) => {
    const q = search.trim().toLowerCase()
    return (!q || [p.name, p.document].some((x) => x.toLowerCase().includes(q))) && (roleFilter === "Todos" || p.role === roleFilter)
  }), [people, search, roleFilter])

  function close() { setModal(null); setDraft(blank); setCrewName(""); setMembers([]); setErrors({}) }

  function savePerson(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!draft.name.trim()) next.name = "Escribe el nombre completo."
    if (!draft.document.trim()) next.document = "Escribe el número de documento."
    else if (people.some((p) => p.document === draft.document.trim())) next.document = "El documento ya está registrado."
    setErrors(next)
    if (Object.keys(next).length) return
    add.person({ name: draft.name.trim(), document: draft.document.trim(), phone: draft.phone.trim(), role: draft.role, active: draft.active === "Activa" })
    close(); show(`${draft.name.trim()} fue registrado.`)
  }

  function saveCrew(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!crewName.trim()) next.crew = "Escribe un nombre para la cuadrilla."
    else if (crews.some((c) => c.name.toLowerCase() === crewName.trim().toLowerCase())) next.crew = "Ya existe una cuadrilla con ese nombre."
    if (!members.length) next.members = "Selecciona al menos una persona."
    setErrors(next)
    if (Object.keys(next).length) return
    add.crew({ name: crewName.trim(), memberIds: members })
    close(); show(`Cuadrilla ${crewName.trim()} creada.`)
  }

  const personColumns: Column<Person>[] = [
    { header: "Nombre", render: (p) => <strong>{p.name}</strong> },
    ...(canManage ? [{ header: "Documento", render: (p: Person) => p.document }] : []),
    { header: "Rol", render: (p) => p.role },
    { header: "Cuenta", render: (p) => <Badge tone={p.active ? "ok" : "neutral"}>{p.active ? "Activa" : "Inactiva"}</Badge> },
  ]
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? "Persona no encontrada"
  const crewColumns: Column<Crew>[] = [
    { header: "Cuadrilla", render: (c) => <strong>{c.name}</strong> },
    { header: "Integrantes", render: (c) => c.memberIds.map(nameOf).join(", ") },
    { header: "Personas", numeric: true, render: (c) => c.memberIds.length },
  ]
  const activePeople = people.filter((p) => p.active)

  return <>
    <PageHeading
      title="Gestión de personal"
      description="Administra quién puede ingresar a VINTRA, con qué rol, y cómo se organizan las cuadrillas de recolección."
      action={canManage ? <div className="actions"><Button icon="plus" primary onClick={() => setModal("person")}>Registrar persona</Button><Button onClick={() => setModal("crew")} disabled={!activePeople.length}>Crear cuadrilla</Button></div> : undefined}
    />
    <div className="figures">
      <Figure lead label="Personas registradas" value={people.length} />
      <Figure label="Cuentas activas" value={activePeople.length} />
      <Figure label="Conductores" value={people.filter((p) => p.role === "Conductor").length} />
      <Figure label="Cuadrillas" value={crews.length} />
    </div>

    <Section title="Personal" subtitle={canManage ? "Las cuentas son de uso administrativo y operativo; no hay registro público de ciudadanos." : undefined}>
      <div className="filters">
        <Field label="Buscar" value={search} onChange={setSearch} placeholder={canManage ? "Nombre o documento" : "Nombre"} />
        <SelectField label="Rol" value={roleFilter} onChange={setRoleFilter}><option>Todos</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</SelectField>
      </div>
      <DataTable caption="Personal registrado" columns={personColumns} rows={filtered} empty={
        <EmptyState title={people.length ? "Nadie coincide con la búsqueda" : "Todavía no hay personal registrado"}
          action={canManage && !people.length ? <Button primary onClick={() => setModal("person")}>Registrar a la primera persona</Button> : undefined}>
          <p>{people.length ? "Prueba con otro nombre o quita el filtro de rol." : "Registra conductores y jefes de operaciones para poder armar cuadrillas."}</p>
        </EmptyState>} />
    </Section>

    <Section title="Cuadrillas" subtitle="Una cuadrilla se asigna junto con una microrruta y un vehículo en Gestión de operación.">
      <DataTable caption="Cuadrillas" columns={crewColumns} rows={crews} empty={
        <EmptyState title="Todavía no hay cuadrillas"><p>{activePeople.length ? "Crea una cuadrilla con las personas activas registradas." : "Primero registra personal activo para poder armar una cuadrilla."}</p></EmptyState>} />
    </Section>

    {modal === "person" && (
      <Modal title="Registrar persona" onClose={close}>
        <form noValidate onSubmit={savePerson}>
          <div className="form-grid">
            <Field autoComplete="name" label="Nombre completo" required value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} error={errors.name} />
            <Field autoComplete="off" label="Documento" required value={draft.document} onChange={(v) => setDraft((d) => ({ ...d, document: v }))} error={errors.document} />
            <Field autoComplete="tel" label="Teléfono" type="tel" value={draft.phone} onChange={(v) => setDraft((d) => ({ ...d, phone: v }))} />
            <SelectField label="Rol" value={draft.role} onChange={(v) => setDraft((d) => ({ ...d, role: v as Person["role"] }))} required>{ROLES.map((r) => <option key={r}>{r}</option>)}</SelectField>
            <SelectField label="Estado de la cuenta" value={draft.active} onChange={(v) => setDraft((d) => ({ ...d, active: v }))} required><option>Activa</option><option>Inactiva</option></SelectField>
          </div>
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Registrar persona</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>
    )}
    {modal === "crew" && (
      <Modal title="Crear cuadrilla" onClose={close}>
        <form noValidate onSubmit={saveCrew}>
          <Field label="Nombre de la cuadrilla" value={crewName} onChange={setCrewName} error={errors.crew} required />
          <fieldset style={{ border: 0, margin: "16px 0 0", padding: 0 }}>
            <legend style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Integrantes</legend>
            {activePeople.map((p) => (
              <label className="map-toggle" key={p.id} style={{ display: "flex", padding: "6px 0" }}>
                <input checked={members.includes(p.id)} onChange={(e) => setMembers((m) => e.target.checked ? [...m, p.id] : m.filter((x) => x !== p.id))} type="checkbox" />
                {p.name} <span className="muted">· {p.role}</span>
              </label>
            ))}
            {errors.members && <span className="error-text" style={{ color: "var(--danger)", fontSize: "var(--text-xs)" }}>{errors.members}</span>}
          </fieldset>
          <div className="actions" style={{ marginTop: 16 }}><Button primary type="submit">Crear cuadrilla</Button><Button onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>
    )}
    {toast}
  </>
}

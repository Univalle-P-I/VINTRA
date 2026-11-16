import { FormEvent, useMemo, useState } from "react"
import { Button, Field, SelectField, PageHeading, Metric, Section, Footer } from "./ui"
import "./styles/people.css"

type StaffStatus = "Activo" | "Inactivo"
type Availability = "Disponible" | "En ruta" | "Descanso" | "Incapacidad"
type Staff = { id: string; name: string; document: string; phone: string; role: string; account: StaffStatus; availability: Availability; shift: string }
const emptyStaff: Staff = { id:"", name:"", document:"", phone:"", role:"Conductor", account:"Activo", availability:"Disponible", shift:"" }

export default function PeoplePanel() {
  const [staff,setStaff] = useState<Staff[]>([])
  const [draft,setDraft] = useState<Staff>(emptyStaff)
  const [search,setSearch] = useState("")
  const [status,setStatus] = useState("Todos")
  const [message,setMessage] = useState("")
  const filtered = useMemo(() => staff.filter(p => {
    const q=search.trim().toLowerCase()
    return (!q || [p.name,p.document,p.role].some(x=>x.toLowerCase().includes(q))) && (status==="Todos" || p.account===status)
  }),[staff,search,status])
  function save(e:FormEvent) {
    e.preventDefault()
    if(!draft.name.trim() || !draft.document.trim()){setMessage("Completa el nombre y el documento.");return}
    if(staff.some(p=>p.document===draft.document)){setMessage("El documento ya está registrado.");return}
    setStaff(current=>[...current,{...draft,id:draft.id||crypto.randomUUID()}])
    setDraft(emptyStaff)
    setMessage("Personal agregado a la lista local. La persistencia requiere conexión con el backend.")
  }
  return <main className="content">
    <PageHeading title="Gestión de personal" description="Administra las cuentas, los roles, la disponibilidad y los datos del personal autorizado." />
    <div className="metrics">
      <Metric label="Personas registradas" value={staff.length} detail="Registros cargados en esta sesión" />
      <Metric label="Cuentas activas" value={staff.filter(p=>p.account==="Activo").length} detail="Según los registros cargados" />
      <Metric label="Disponibles" value={staff.filter(p=>p.availability==="Disponible").length} detail="Según los registros cargados" />
      <Metric label="Inactivas" value={staff.filter(p=>p.account==="Inactivo").length} detail="Según los registros cargados" />
    </div>
    <Section title="Personal registrado" subtitle="El listado se llenará con los registros reales del sistema.">
      <div className="filters"><Field label="Buscar" value={search} onChange={setSearch} placeholder="Nombre, documento o rol" /><SelectField label="Cuenta" value={status} onChange={setStatus}><option>Todos</option><option>Activo</option><option>Inactivo</option></SelectField></div>
      <div className="data-table responsive-table staff-table">
        <div className="table-row table-head"><span>Nombre</span><span>Documento</span><span>Rol</span><span>Disponibilidad</span><span>Cuenta</span></div>
        {filtered.length ? filtered.map(p=><div className="table-row" key={p.id}><span data-label="Nombre">{p.name}</span><span data-label="Documento">{p.document}</span><span data-label="Rol">{p.role}</span><span data-label="Disponibilidad">{p.availability}</span><span data-label="Cuenta">{p.account}</span></div>) : <p className="empty-state">No hay personal registrado para mostrar.</p>}
      </div>
    </Section>
    <Section title="Registrar personal" subtitle="En el MVP, las cuentas son de uso administrativo y operativo. No se habilita registro público de ciudadanos.">
      <form className="assignment-form" onSubmit={save}><div className="assignment-grid">
        <Field label="Nombre completo" value={draft.name} onChange={v=>setDraft(d=>({...d,name:v}))} />
        <Field label="Documento" value={draft.document} onChange={v=>setDraft(d=>({...d,document:v}))} />
        <Field label="Teléfono" value={draft.phone} onChange={v=>setDraft(d=>({...d,phone:v}))} />
        <SelectField label="Rol" value={draft.role} onChange={v=>setDraft(d=>({...d,role:v}))}><option>Administrador</option><option>Supervisor</option><option>Conductor</option><option>Operario</option></SelectField>
        <SelectField label="Estado de cuenta" value={draft.account} onChange={v=>setDraft(d=>({...d,account:v as StaffStatus}))}><option>Activo</option><option>Inactivo</option></SelectField>
        <SelectField label="Disponibilidad" value={draft.availability} onChange={v=>setDraft(d=>({...d,availability:v as Availability}))}><option>Disponible</option><option>En ruta</option><option>Descanso</option><option>Incapacidad</option></SelectField>
        <Field label="Turno" value={draft.shift} onChange={v=>setDraft(d=>({...d,shift:v}))} />
      </div>{message&&<p className="form-message" role="status">{message}</p>}<div className="actions"><Button primary type="submit">Registrar personal</Button><Button onClick={()=>{setDraft(emptyStaff);setMessage("")}}>Limpiar</Button></div></form>
    </Section>
    <Footer />
  </main>
}

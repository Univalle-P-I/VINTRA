import { FormEvent, useMemo, useState } from "react"
import { Button, Field, SelectField, PageHeading, Metric, Section, Footer, SchematicMap } from "./ui"

type TripStatus = "Programado" | "En recorrido" | "Finalizado" | "Cancelado"
type Trip = { id:string; route:string; vehicle:string; driver:string; date:string; status:TripStatus }
const emptyTrip:Trip={id:"",route:"",vehicle:"",driver:"",date:"",status:"Programado"}
export default function OperationsPanel(){
  const [trips,setTrips]=useState<Trip[]>([])
  const [draft,setDraft]=useState<Trip>(emptyTrip)
  const [search,setSearch]=useState("")
  const [status,setStatus]=useState("Todos")
  const [message,setMessage]=useState("")
  const filtered=useMemo(()=>trips.filter(t=>(!search.trim()||[t.id,t.route,t.vehicle,t.driver].some(v=>v.toLowerCase().includes(search.trim().toLowerCase())))&&(status==="Todos"||t.status===status)),[trips,search,status])
  function save(e:FormEvent){e.preventDefault();if(!draft.route.trim()||!draft.date){setMessage("Selecciona una ruta e indica la fecha.");return}setTrips(current=>[...current,{...draft,id:draft.id||crypto.randomUUID()}]);setDraft(emptyTrip);setMessage("Recorrido agregado a la lista local. La asignación real requiere validación y persistencia desde el backend.")}
  return <main className="content">
    <PageHeading title="Gestión de operación" description="Programa recorridos, asigna recursos y consulta el estado de las operaciones." />
    <div className="metrics"><Metric label="Recorridos registrados" value={trips.length} detail="Registros cargados en esta sesión"/><Metric label="Programados" value={trips.filter(t=>t.status==="Programado").length} detail="Según los registros cargados"/><Metric label="En recorrido" value={trips.filter(t=>t.status==="En recorrido").length} detail="Según los registros cargados"/><Metric label="Finalizados" value={trips.filter(t=>t.status==="Finalizado").length} detail="Según los registros cargados"/></div>
    <Section title="Recorridos" subtitle="El seguimiento en tiempo real requiere integración con los servicios de operación y GPS.">
      <div className="filters"><Field label="Buscar" value={search} onChange={setSearch} placeholder="Ruta, vehículo o conductor"/><SelectField label="Estado" value={status} onChange={setStatus}><option>Todos</option><option>Programado</option><option>En recorrido</option><option>Finalizado</option><option>Cancelado</option></SelectField></div>
      <div className="data-table responsive-table operation-list-table"><div className="table-row table-head"><span>Ruta</span><span>Vehículo</span><span>Conductor</span><span>Fecha</span><span>Estado</span></div>{filtered.length?filtered.map(t=><div className="table-row" key={t.id}><span data-label="Ruta">{t.route}</span><span data-label="Vehículo">{t.vehicle||"Sin asignar"}</span><span data-label="Conductor">{t.driver||"Sin asignar"}</span><span data-label="Fecha">{t.date}</span><span data-label="Estado">{t.status}</span></div>):<p className="empty-state">No hay recorridos registrados para mostrar.</p>}</div>
    </Section>
    <div className="two-column"><Section title="Monitoreo GPS" subtitle="La ubicación se mostrará cuando exista conexión con el proveedor GPS."><SchematicMap/><p className="empty-state">Sin datos de ubicación disponibles.</p></Section><Section title="Novedades e incidencias" subtitle="Las incidencias se mostrarán cuando sean registradas en el sistema."><p className="empty-state">No hay novedades registradas.</p></Section></div>
    <Section title="Programar recorrido"><form className="assignment-form" onSubmit={save}><div className="assignment-grid"><Field label="Ruta" value={draft.route} onChange={v=>setDraft(d=>({...d,route:v}))}/><Field label="Fecha" type="date" value={draft.date} onChange={v=>setDraft(d=>({...d,date:v}))}/><Field label="Vehículo" value={draft.vehicle} onChange={v=>setDraft(d=>({...d,vehicle:v}))}/><Field label="Conductor" value={draft.driver} onChange={v=>setDraft(d=>({...d,driver:v}))}/><SelectField label="Estado" value={draft.status} onChange={v=>setDraft(d=>({...d,status:v as TripStatus}))}><option>Programado</option><option>En recorrido</option><option>Finalizado</option><option>Cancelado</option></SelectField></div>{message&&<p className="form-message" role="status">{message}</p>}<div className="actions"><Button primary type="submit">Guardar recorrido</Button><Button onClick={()=>{setDraft(emptyTrip);setMessage("")}}>Limpiar</Button></div></form></Section>
    <Footer/>
  </main>
}

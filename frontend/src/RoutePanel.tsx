import { useState } from "react"
import { Button, Field, SelectField, PageHeading, Metric, Section, Footer, SchematicMap } from "./ui"

type RouteStatus = "Activa" | "Programada" | "Inactiva"
type Route = { id:string; name:string; zone:string; stops:number; status:RouteStatus }
export default function RoutePanel() {
  const [routes,setRoutes]=useState<Route[]>([])
  const [search,setSearch]=useState("")
  const [status,setStatus]=useState("Todas")
  const [draft,setDraft]=useState({id:"",name:"",zone:"",stops:""})
  const [message,setMessage]=useState("")
  const filtered=routes.filter(r=>(!search.trim()||[r.id,r.name,r.zone].some(v=>v.toLowerCase().includes(search.trim().toLowerCase())))&&(status==="Todas"||r.status===status))
  function addRoute(e:React.FormEvent){e.preventDefault();if(!draft.id.trim()||!draft.name.trim()){setMessage("Completa el código y el nombre de la ruta.");return}if(routes.some(r=>r.id===draft.id)){setMessage("El código ya existe.");return}setRoutes(v=>[...v,{...draft,stops:Number(draft.stops)||0,status:"Programada"}]);setDraft({id:"",name:"",zone:"",stops:""});setMessage("Ruta agregada a la lista local. La persistencia requiere conexión con el backend.")}
  return <main className="content">
    <PageHeading title="Gestión de rutas" description="Planifica y administra macrorutas, zonas de cobertura y microrutas." />
    <div className="metrics"><Metric label="Rutas registradas" value={routes.length} detail="Registros cargados en esta sesión" /><Metric label="Activas" value={routes.filter(r=>r.status==="Activa").length} detail="Según los registros cargados" /><Metric label="Programadas" value={routes.filter(r=>r.status==="Programada").length} detail="Según los registros cargados" /><Metric label="Inactivas" value={routes.filter(r=>r.status==="Inactiva").length} detail="Según los registros cargados" /></div>
    <Section title="Rutas registradas" subtitle="No se incluyen rutas de ejemplo. Los registros aparecerán al consultarlos desde el backend o agregarlos.">
      <div className="filters"><Field label="Buscar ruta" value={search} onChange={setSearch} placeholder="Código, nombre o zona" /><SelectField label="Estado" value={status} onChange={setStatus}><option>Todas</option><option>Activa</option><option>Programada</option><option>Inactiva</option></SelectField></div>
      <div className="data-table responsive-table route-list-table"><div className="table-row table-head"><span>Código</span><span>Macroruta</span><span>Zona</span><span>Paradas</span><span>Estado</span></div>{filtered.length?filtered.map(r=><div className="table-row" key={r.id}><span data-label="Código">{r.id}</span><span data-label="Macroruta">{r.name}</span><span data-label="Zona">{r.zone}</span><span data-label="Paradas">{r.stops}</span><span data-label="Estado">{r.status}</span></div>):<p className="empty-state">No hay rutas registradas para mostrar.</p>}</div>
    </Section>
    <div className="two-column"><Section title="Vista de cobertura" subtitle="La cartografía y las ubicaciones reales requieren integración con el servicio geográfico."><SchematicMap /><p className="muted">Vista esquemática sin coordenadas ni recorridos reales.</p></Section><Section title="Microrutas" subtitle="Las microrutas se asociarán a una macroruta cuando existan registros."><p className="empty-state">No hay microrutas registradas.</p></Section></div>
    <Section title="Registrar macroruta"><form className="assignment-form" onSubmit={addRoute}><div className="assignment-grid"><Field label="Código" value={draft.id} onChange={v=>setDraft(d=>({...d,id:v}))}/><Field label="Nombre" value={draft.name} onChange={v=>setDraft(d=>({...d,name:v}))}/><Field label="Zona" value={draft.zone} onChange={v=>setDraft(d=>({...d,zone:v}))}/><Field label="Número de paradas" type="number" value={draft.stops} onChange={v=>setDraft(d=>({...d,stops:v}))}/></div>{message&&<p className="form-message" role="status">{message}</p>}<div className="actions"><Button primary type="submit">Agregar ruta</Button><Button onClick={()=>{setDraft({id:"",name:"",zone:"",stops:""});setMessage("")}}>Limpiar</Button></div></form></Section>
    <Footer />
  </main>
}

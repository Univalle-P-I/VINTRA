import { Button, Metric, PageHeading, Section } from "./ui"

type Props = {
  goToFleet: () => void
  goToPeople: () => void
  goToRoutes: () => void
  goToOperations: () => void
}

export default function AdminPanel({ goToFleet, goToPeople, goToRoutes, goToOperations }: Props) {
  return (
    <main className="content">
      <PageHeading
        title="Panel administrativo"
        description="Vista general para gestionar los recursos, el personal, las rutas y la operación."
      />
      <div className="actions">
        <Button onClick={goToOperations} primary>Ir a operaciones</Button>
        <Button onClick={goToFleet}>Gestionar flota</Button>
      </div>
      <div className="metrics admin-metrics">
        <Metric label="Vehículos registrados" value="—" detail="Información pendiente de conexión" />
        <Metric label="Personal registrado" value="—" detail="Información pendiente de conexión" />
        <Metric label="Rutas registradas" value="—" detail="Información pendiente de conexión" />
        <Metric label="Recorridos activos" value="—" detail="Información pendiente de conexión" />
      </div>
      <Section title="Estado operativo" subtitle="El resumen se completará al conectar los servicios del backend.">
        <p className="empty-state">No hay datos operativos disponibles.</p>
      </Section>
      <Section title="Accesos administrativos">
        <div className="actions">
          <Button onClick={goToFleet}>Gestionar vehículos</Button>
          <Button onClick={goToPeople}>Gestionar personal</Button>
          <Button onClick={goToRoutes}>Gestionar rutas</Button>
          <Button onClick={goToOperations}>Consultar recorridos</Button>
        </div>
      </Section>
    </main>
  )
}

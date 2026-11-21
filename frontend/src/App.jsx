import { useEffect, useRef, useState } from 'react'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import AppShell from './AppShell'
import FleetPanel from './FleetPanel'
import PeoplePanel from './PeoplePanel'
import RoutePanel from './RoutePanel'
import OperationsPanel from './OperationsPanel'
import OverviewPanel from './OverviewPanel'
import { MapPage, DriverPanel, CitizenPanel } from './RolePanels'
import { DataProvider } from './store'
import { CAN_MANAGE, homeFor, navFor } from './navigation'
import './styles/app.css'

const EXIT_MS = 220
const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function App() {
  const [screen, setScreen] = useState('landing') // landing | login | app
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  // Cambio de pantalla: la actual se desliza y se desvanece; la nueva entra escalonada.
  const transition = (change) => {
    if (prefersReducedMotion()) return change()
    clearTimeout(timer.current)
    setLeaving(true)
    timer.current = setTimeout(() => {
      change()
      setLeaving(false)
    }, EXIT_MS)
  }
  const [role, setRole] = useState('admin')
  const [page, setPage] = useState('overview')

  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const goToHome = () => transition(() => { setScreen('landing'); top() })
  const goToLogin = () => transition(() => { setScreen('login'); top() })
  const navigate = (id) => { setPage(id); top() }

  // La autenticación real aún no existe: el rol elegido en el login solo simula
  // qué parte de la interfaz se muestra. Los permisos reales los define el backend.
  const handleLogin = (selectedRole = 'admin') =>
    transition(() => {
      setRole(selectedRole)
      setPage(homeFor(selectedRole))
      setScreen('app')
      top()
    })

  const stage = (node) => (
    <div className={leaving ? 'screen screen-leaving' : 'screen'} key={screen}>
      {node}
    </div>
  )

  if (screen === 'landing') return stage(<LandingPage onLogin={goToLogin} />)
  if (screen === 'login') return stage(<LoginPage onHome={goToHome} onLogin={handleLogin} />)

  const allowed = navFor(role).some((i) => i.id === page) ? page : homeFor(role)
  const can = (k) => CAN_MANAGE[k].includes(role)

  return stage(
    <DataProvider>
      <AppShell role={role} screen={allowed} onNavigate={navigate} onLogout={goToLogin} onHome={goToHome}>
        {allowed === 'overview' && <OverviewPanel role={role} onNavigate={navigate} />}
        {allowed === 'fleet' && <FleetPanel canManage={can('fleet')} />}
        {allowed === 'people' && <PeoplePanel canManage={can('people')} />}
        {allowed === 'routes' && <RoutePanel canManage={can('routes')} />}
        {allowed === 'operations' && <OperationsPanel canManage={can('operations')} />}
        {allowed === 'map' && <MapPage />}
        {allowed === 'myroute' && <DriverPanel />}
        {allowed === 'schedules' && <CitizenPanel />}
      </AppShell>
    </DataProvider>
  )
}

export default App

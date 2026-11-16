
import { useState } from 'react'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import FleetPanel from './FleetPanel'
import PeoplePanel from './PeoplePanel'
import RoutePanel from './RoutePanel'
import OperationsPanel from './OperationsPanel'
import ConnectionStatus from './ConnectionStatus'
import './App.css'

function App() {
  const [screen, setScreen] = useState('landing')

  const goToHome = () => {
    setScreen('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToLogin = () => {
    setScreen('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPeople = () => {
    setScreen('people')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToRoutes = () => {
    setScreen('routes')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToOperations = () => {
    setScreen('operations')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToFleet = () => {
    setScreen('fleet')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = () => {
    goToPeople()
  }

  return (
    <>
      {screen === 'landing' && (
        <LandingPage onLogin={goToLogin} />
      )}

      {screen === 'login' && (
        <LoginPage onHome={goToHome} onLogin={handleLogin} />
      )}

      {['people', 'routes', 'operations', 'fleet'].includes(screen) && (
        <nav aria-label="Navegación de módulos" className="module-navigation">
          <button
            aria-current={screen === 'fleet' ? 'page' : undefined}
            className="module-nav-item"
            onClick={goToFleet}
            type="button"
          >
            Gestión de flota
          </button>
          <button
            aria-current={screen === 'people' ? 'page' : undefined}
            className="module-nav-item"
            onClick={goToPeople}
            type="button"
          >
            Gestión de personal
          </button>
          <button
            aria-current={screen === 'routes' ? 'page' : undefined}
            className="module-nav-item"
            onClick={goToRoutes}
            type="button"
          >
            Gestión de rutas
          </button>
          <button
            aria-current={screen === 'operations' ? 'page' : undefined}
            className="module-nav-item"
            onClick={goToOperations}
            type="button"
          >
            Gestión de operación
          </button>
        </nav>
      )}

      {screen === 'people' && <PeoplePanel />}
      {screen === 'routes' && <RoutePanel />}
      {screen === 'operations' && <OperationsPanel />}
      {screen === 'fleet' && <FleetPanel />}

      <ConnectionStatus />
    </>
  )
}

export default App

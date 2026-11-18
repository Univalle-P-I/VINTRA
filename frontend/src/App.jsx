
import { useState } from 'react'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import FleetPanel from './FleetPanel'
import PeoplePanel from './PeoplePanel'
import RoutePanel from './RoutePanel'
import OperationsPanel from './OperationsPanel'
import AdminPanel from './AdminPanel'
import Shell from './Shell'
import ConnectionStatus from './ConnectionStatus'
import './App.css'
import './styles/console.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [page, setPage] = useState('panel')

  const goToHome = () => {
    setScreen('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToLogin = () => {
    setScreen('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigate = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = () => {
    setPage('panel')
    setScreen('app')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {screen === 'landing' && (
        <LandingPage onLogin={goToLogin} />
      )}

      {screen === 'login' && (
        <LoginPage onHome={goToHome} onLogin={handleLogin} />
      )}

      {screen === 'app' && (
        <Shell page={page} setPage={navigate} onHome={goToHome}>
          {page === 'panel' && (
            <AdminPanel
              goToFleet={() => navigate('fleet')}
              goToPeople={() => navigate('people')}
              goToRoutes={() => navigate('routes')}
              goToOperations={() => navigate('operations')}
            />
          )}
          {page === 'fleet' && <FleetPanel />}
          {page === 'people' && <PeoplePanel />}
          {page === 'routes' && <RoutePanel />}
          {page === 'operations' && <OperationsPanel />}
        </Shell>
      )}
      <ConnectionStatus />
    </>
  )
}

export default App

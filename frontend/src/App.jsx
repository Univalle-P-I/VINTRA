
import { useState } from 'react'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
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

      {screen === 'people' && <PeoplePanel />}
      {screen === 'routes' && <RoutePanel />}
      {screen === 'operations' && <OperationsPanel />}

      <ConnectionStatus />
    </>
  )
}

export default App


import { useState } from 'react'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
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

  const handleLogin = () => {
    window.alert(
      'El inicio de sesión se conectará cuando se integre la autenticación del backend.'
    )
  }

  return (
    <>
      {screen === 'landing' ? (
        <LandingPage onLogin={goToLogin} />
      ) : (
        <LoginPage onHome={goToHome} onLogin={handleLogin} />
      )}

      <ConnectionStatus />
    </>
  )
}

export default App

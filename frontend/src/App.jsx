
import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import './App.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [mensaje, setMensaje] = useState('Conectando con VINTRA Backend...')

  useEffect(() => {
    axios
      .get('http://localhost:3001/health')
      .then((response) => {
        setMensaje(
          `Backend conectado: ${response.data.service} - ${response.data.status}`
        )
      })
      .catch(() => {
        setMensaje('No se pudo conectar con el backend')
      })
  }, [])

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

      <p className="backend-status" role="status">
        {mensaje}
      </p>
    </>
  )
}

export default App

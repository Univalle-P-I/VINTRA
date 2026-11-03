
import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import './App.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [mensaje, setMensaje] = useState('Conectando con VINTRA Backend...')
  const [estadoDB, setEstadoDB] = useState('Comprobando PostgreSQL...')

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL

    if (!API_URL) {
      setMensaje('No se ha configurado la URL del backend')
      setEstadoDB('No se pudo comprobar PostgreSQL')
      return
    }

    axios
      .get(`${API_URL}/health`)
      .then((response) => {
        setMensaje(`Backend: ${response.data.status}`)
      })
      .catch(() => {
        setMensaje('No se pudo conectar con el backend')
      })

    axios
      .get(`${API_URL}/health/db`)
      .then((response) => {
        setEstadoDB(`PostgreSQL: ${response.data.database}`)
      })
      .catch(() => {
        setEstadoDB('PostgreSQL: desconectado')
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
<<<<<<< HEAD
=======

      <p className="backend-status" role="status">
        {estadoDB}
      </p>
>>>>>>> fe256838aace1b075037835871210c3b3b6658fb
    </>
  )
}

export default App


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

<<<<<<< HEAD
      <p className="backend-status" role="status">
        {mensaje}
      </p>
<<<<<<< HEAD
=======

      <p className="backend-status" role="status">
        {estadoDB}
      </p>
>>>>>>> fe256838aace1b075037835871210c3b3b6658fb
=======
      <ConnectionStatus />
>>>>>>> ddd2e44185321c7266369b5e41cc90eea28725d8
    </>
  )
}

export default App

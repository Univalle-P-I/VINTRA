import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
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

  return (
    <div>
      <h1>VINTRA</h1>
      <p>{mensaje}</p>
    </div>
  )
}

export default App
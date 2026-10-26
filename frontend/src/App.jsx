import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [mensaje, setMensaje] = useState('Conectando con el backend...')

  useEffect(() => {
    axios
      .get('http://localhost:3002/')
      .then((response) => {
        setMensaje(`Backend conectado: ${response.data}`)
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
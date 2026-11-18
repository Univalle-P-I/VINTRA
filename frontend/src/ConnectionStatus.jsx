import { useEffect, useState } from 'react'
import axios from 'axios'
import './ConnectionStatus.css'

const pendingStatus = { state: 'checking', message: 'Comprobando…' }

function ConnectionStatus() {
  const [backend, setBackend] = useState(pendingStatus)
  const [database, setDatabase] = useState(pendingStatus)
  const [attempt, setAttempt] = useState(0)
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

  useEffect(() => {
    let active = true

    const checkConnections = async () => {
      if (!apiUrl) {
        setBackend({ state: 'error', message: 'URL no configurada' })
        setDatabase({ state: 'error', message: 'No verificada' })
        return
      }

      setBackend(pendingStatus)
      setDatabase(pendingStatus)

      const [backendResult, databaseResult] = await Promise.allSettled([
        axios.get(`${apiUrl}/health`, { timeout: 5000 }),
        axios.get(`${apiUrl}/health/db`, { timeout: 5000 }),
      ])

      if (!active) return

      setBackend(
        backendResult.status === 'fulfilled' &&
          backendResult.value.data?.status === 'ok'
          ? { state: 'available', message: 'Disponible' }
          : { state: 'error', message: 'No disponible' }
      )

      setDatabase(
        databaseResult.status === 'fulfilled' &&
          databaseResult.value.data?.status === 'ok' &&
          databaseResult.value.data?.database === 'connected'
          ? { state: 'available', message: 'Disponible' }
          : { state: 'error', message: 'No disponible' }
      )
    }

    void checkConnections()

    return () => {
      active = false
    }
  }, [attempt, apiUrl])

  return (
    <section
      className="connection-status"
      aria-labelledby="connection-title"
      aria-busy={backend.state === 'checking' || database.state === 'checking'}
    >
      <div className="connection-status__heading">
        <div>
          <p className="connection-status__eyebrow">PRUEBA DE CONEXIÓN</p>
          <h2 id="connection-title">Estado del entorno</h2>
          <p className="connection-status__description">
            Comunicación frontend → API → PostgreSQL
          </p>
        </div>
        <button
          className="connection-status__retry"
          onClick={() => setAttempt((current) => current + 1)}
          type="button"
        >
          Comprobar de nuevo
        </button>
      </div>

      <div className="connection-status__checks" aria-live="polite">
        <ConnectionCheck label="API backend" status={backend} />
        <ConnectionCheck label="PostgreSQL" status={database} />
      </div>
    </section>
  )
}

function ConnectionCheck({ label, status }) {
  return (
    <div className="connection-status__check" data-state={status.state}>
      <span className="connection-status__indicator" aria-hidden="true" />
      <span className="connection-status__label">{label}</span>
      <strong>{status.message}</strong>
    </div>
  )
}

export default ConnectionStatus

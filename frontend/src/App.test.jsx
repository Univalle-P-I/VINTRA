import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import App from './App'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('App connection smoke test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_API_URL', 'http://localhost:3002')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('confirms the backend and PostgreSQL are available', async () => {
    axios.get.mockImplementation((url) =>
      Promise.resolve({
        data: url.endsWith('/health/db')
          ? { status: 'ok', database: 'connected' }
          : { status: 'ok', service: 'vintra-backend' },
      })
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText('Disponible')).toHaveLength(2)
    })

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3002/health', {
      timeout: 5000,
    })
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3002/health/db',
      { timeout: 5000 }
    )
  })

  it('reports the database independently when its health query fails', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/health/db')
        ? Promise.reject(new Error('Database unavailable'))
        : Promise.resolve({ data: { status: 'ok', service: 'vintra-backend' } })
    )

    render(<App />)

    await screen.findByText('API backend')
    await waitFor(() => {
      expect(screen.getByText('API backend').parentElement).toHaveTextContent(
        'Disponible'
      )
      expect(screen.getByText('PostgreSQL').parentElement).toHaveTextContent(
        'No disponible'
      )
    })
  })

  it('shows setup guidance when the API URL is missing', async () => {
    vi.stubEnv('VITE_API_URL', '')

    render(<App />)

    await screen.findByText('URL no configurada')

    expect(axios.get).not.toHaveBeenCalled()
  })

  it('allows returning from the login screen to the landing page', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))

    const user = userEvent.setup()
    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: /iniciar sesión|iniciar sesion|ingresar|acceder|login/i,
      })
    )

    expect(screen.getByLabelText(/correo|email|usuario/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /volver|inicio|regresar/i })
    )
  })
})

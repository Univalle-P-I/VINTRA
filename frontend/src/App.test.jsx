
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import App from './App'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('muestra la landing y el estado inicial del backend', () => {
    axios.get.mockReturnValue(new Promise(() => {}))

    render(<App />)

    expect(
      screen.getByText('Conectando con VINTRA Backend...')
    ).toBeInTheDocument()
  })

  it('muestra el estado cuando el backend responde correctamente', async () => {
    axios.get.mockResolvedValue({
      data: { service: 'VINTRA', status: 'ok' },
    })

    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByText('Backend conectado: VINTRA - ok')
      ).toBeInTheDocument()
    })
  })

  it('muestra un mensaje cuando falla la conexión al backend', async () => {
    axios.get.mockRejectedValue(new Error('Error de conexión'))

    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo conectar con el backend')
      ).toBeInTheDocument()
    })
  })

  it('permite navegar al login y regresar al inicio', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))

    const user = userEvent.setup()
    render(<App />)

    // Busca un botón o enlace de acceso al login.
    const loginButton = await screen.findByRole('button', {
      name: /iniciar sesión|iniciar sesion|ingresar|acceder|login/i,
    })

    await user.click(loginButton)

    // Comprueba que el formulario de acceso se haya mostrado.
    expect(
      screen.getByLabelText(/correo|email|usuario/i)
    ).toBeInTheDocument()

    // Regresa al inicio.
    await user.click(
      screen.getByRole('button', { name: /volver|inicio|regresar/i })
    )
  })
})

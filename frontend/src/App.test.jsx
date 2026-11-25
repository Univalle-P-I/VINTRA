import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import App from './App'

vi.mock('./LandingMap', () => ({ default: () => null }))
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

async function signIn(user, account) {
  const [enter] = await screen.findAllByRole('button', { name: /iniciar sesión/i })
  await user.click(enter)
  await user.type(await screen.findByLabelText(/usuario o correo/i), 'demo@example.org')
  await user.type(screen.getByLabelText(/contraseña/i), 'clave')
  if (account) await user.click(screen.getByRole('radio', { name: new RegExp(account) }))
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
  // La pantalla actual sale con una animación breve antes de mostrar la siguiente.
  await screen.findByRole('navigation', { name: 'Navegación de módulos' })
}

const moduleNav = () => screen.getByRole('navigation', { name: 'Navegación de módulos' })

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
    await signIn(userEvent.setup())

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
    await signIn(userEvent.setup())

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
    await signIn(userEvent.setup())

    await screen.findByText('URL no configurada')

    expect(axios.get).not.toHaveBeenCalled()
  })

  it('allows returning from the login screen to the landing page', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))

    const user = userEvent.setup()
    render(<App />)

    const [enter] = await screen.findAllByRole('button', { name: /iniciar sesión/i })
    await user.click(enter)

    expect(await screen.findByLabelText(/usuario o correo/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /volver|inicio|regresar/i })
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: /Buenaventura/ })
    ).toBeInTheDocument()
  })

  it('opens fleet from the module navigation after login', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))

    const user = userEvent.setup()
    render(<App />)

    await signIn(user)
    await user.click(
      within(moduleNav()).getByRole('button', { name: 'Gestión de flota' })
    )

    expect(
      screen.getByText('Gestión de flota', { selector: '.page-title' })
    ).toBeInTheDocument()
  })

  it('shows every module to the administrator, starting at the overview', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<App />)

    await signIn(user)

    expect(screen.getByText('Resumen', { selector: '.page-title' })).toBeInTheDocument()
    const nav = within(moduleNav())
    for (const name of ['Resumen', 'Gestión de operación', 'Gestión de flota', 'Gestión de personal', 'Gestión de rutas', 'Mapa']) {
      expect(nav.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('limits the driver to their own route', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<App />)

    await signIn(user, 'Conductor')

    const nav = within(moduleNav())
    expect(nav.getAllByRole('button').filter((b) => b.className.includes('nav-item'))).toHaveLength(1)
    expect(nav.getByRole('button', { name: 'Mi recorrido' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Gestión de flota')).not.toBeInTheDocument()
  })

  it('lets the operations chief consult the fleet without registering vehicles', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<App />)

    await signIn(user, 'Jefe de operaciones')
    await user.click(within(moduleNav()).getByRole('button', { name: 'Gestión de flota' }))

    expect(screen.queryByRole('button', { name: /registrar/i })).not.toBeInTheDocument()
    await user.click(within(moduleNav()).getByRole('button', { name: 'Gestión de operación' }))
    expect(screen.getByRole('button', { name: /nueva asignación/i })).toBeInTheDocument()
  })

  it('returns to the login screen when signing out', async () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<App />)

    await signIn(user)
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByLabelText(/usuario o correo/i)).toBeInTheDocument()
  })
})

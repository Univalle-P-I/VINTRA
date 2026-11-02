
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('muestra el formulario y los tipos de cuenta', () => {
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: /inicio de sesión/i }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/usuario o correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()

    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('Conductor')).toBeInTheDocument()
    expect(screen.getByText('Ciudadano')).toBeInTheDocument()
  })

  it('muestra el mensaje inicial de credenciales incorrectas', () => {
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText('Credenciales incorrectas'),
    ).toBeInTheDocument()
  })

  it('muestra un mensaje cuando el correo está vacío', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()

    render(<LoginPage onHome={vi.fn()} onLogin={onLogin} />)

    await user.clear(screen.getByLabelText(/usuario o correo/i))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      screen.getByText(
        'Ingresa tu correo y contraseña para continuar.',
      ),
    ).toBeInTheDocument()

    expect(onLogin).not.toHaveBeenCalled()
  })

  it('muestra un mensaje cuando la contraseña está vacía', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()

    render(<LoginPage onHome={vi.fn()} onLogin={onLogin} />)

    await user.clear(screen.getByLabelText(/contraseña/i))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      screen.getByText(
        'Ingresa tu correo y contraseña para continuar.',
      ),
    ).toBeInTheDocument()

    expect(onLogin).not.toHaveBeenCalled()
  })

  it('ejecuta onLogin cuando ambos campos tienen contenido', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()

    render(<LoginPage onHome={vi.fn()} onLogin={onLogin} />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(onLogin).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('ejecuta onHome al pulsar el botón de inicio', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()

    render(<LoginPage onHome={onHome} onLogin={vi.fn()} />)

    await user.click(
      screen.getByRole('button', {
        name: /volver a la página de inicio/i,
      }),
    )

    expect(onHome).toHaveBeenCalledOnce()
  })
})

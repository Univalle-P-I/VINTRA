
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

  it('no muestra errores antes de enviar el formulario', () => {
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('ofrece tres perfiles activos y deja Ciudadano como próximamente', () => {
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(4)
    expect(screen.getByRole('radio', { name: /Jefe de operaciones/ })).toBeEnabled()
    expect(screen.getByRole('radio', { name: /Ciudadano/ })).toBeDisabled()
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
  })

  it('envía el perfil elegido al iniciar sesión', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    render(<LoginPage onHome={vi.fn()} onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/usuario o correo/i), 'jefe@example.org')
    await user.type(screen.getByLabelText(/contraseña/i), 'clave')
    await user.click(screen.getByRole('radio', { name: /Jefe de operaciones/ }))
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(onLogin).toHaveBeenCalledExactlyOnceWith('ops')
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

    await user.type(screen.getByLabelText(/usuario o correo/i), 'usuario@example.org')
    await user.type(screen.getByLabelText(/contraseña/i), 'clave')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(onLogin).toHaveBeenCalledExactlyOnceWith('admin')
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

  it('permite mostrar y ocultar la contraseña', async () => {
    const user = userEvent.setup()
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    const input = screen.getByLabelText(/contraseña/i)
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('marca como inválido el campo vacío al fallar la validación', async () => {
    const user = userEvent.setup()
    render(<LoginPage onHome={vi.fn()} onLogin={vi.fn()} />)

    await user.type(screen.getByLabelText(/usuario o correo/i), 'alguien@example.org')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/usuario o correo/i)).not.toHaveAttribute('aria-invalid')
  })
})

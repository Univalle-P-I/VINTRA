import { FormEvent, useState } from "react"

import { Logo } from "./BrandMark"
import type { Role } from "./domain"
import "./login-page.css"

const accountTypes: { role: Role; title: string; description: string; soon?: boolean }[] = [
  { role: "admin", title: "Administrador", description: "Visión completa de la plataforma." },
  { role: "ops", title: "Jefe de operaciones", description: "Organiza y supervisa cada jornada." },
  { role: "driver", title: "Conductor", description: "Solo lo necesario para hacer su recorrido." },
  { role: "citizen", title: "Ciudadano", description: "Consulta de rutas y horarios.", soon: true },
]

export default function LoginPage({
  onHome,
  onLogin,
}: {
  onHome: () => void
  onLogin: (role: Role) => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setMessage("Ingresa tu correo y contraseña para continuar.")

      return
    }

    setMessage("")

    onLogin(role)
  }

  const selected = accountTypes.find((a) => a.role === role) ?? accountTypes[0]
  const emailInvalid = Boolean(message) && !email.trim()
  const passwordInvalid = Boolean(message) && !password

  return (
    <div className="login-page">
      <aside className="login-aside">
        <button
          aria-label="Volver a la página de inicio"
          className="login-home-button"
          onClick={onHome}
          type="button"
        >
          <Logo tone="light" />
        </button>
        <p className="login-aside-text">
          Recolección de residuos, bajo control en Buenaventura.
        </p>
      </aside>

      <main className="login-main">
        <div className="login-panel">
          <div className="login-heading">
            <h1>Inicio de sesión</h1>
            <p>Elige tu perfil para continuar.</p>
          </div>

          <form className="login-form" noValidate onSubmit={submit}>
            <fieldset className="login-profiles">
              <legend>Tipo de cuenta</legend>
              <div className="role-chips" role="radiogroup" aria-label="Tipo de cuenta">
                {accountTypes.map((account) => (
                  <label
                    className="role-chip"
                    data-disabled={account.soon ? true : undefined}
                    data-selected={role === account.role}
                    key={account.title}
                  >
                    <input
                      checked={role === account.role}
                      className="sr-only"
                      disabled={account.soon}
                      name="account-role"
                      onChange={() => setRole(account.role)}
                      type="radio"
                      value={account.role}
                    />
                    <span>{account.title}</span>
                    {account.soon && <small>Próximamente</small>}
                  </label>
                ))}
              </div>
              <p className="role-desc" key={role}>{selected.description}</p>
            </fieldset>

            <label className="login-field">
              <span>Usuario o correo</span>
              <input
                aria-invalid={emailInvalid || undefined}
                aria-describedby={emailInvalid ? "login-error" : undefined}
                autoComplete="username"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario.ejemplo@example.org"
                required
                type="text"
                value={email}
              />
            </label>

            <label className="login-field">
              <span>Contraseña</span>
              <span className="login-password">
                <input
                  aria-invalid={passwordInvalid || undefined}
                  aria-describedby={passwordInvalid ? "login-error" : undefined}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                />
                <button
                  aria-pressed={showPassword}
                  className="login-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </span>
            </label>

            {message && (
              <p className="login-message" id="login-error" role="alert">
                {message}
              </p>
            )}

            <button className="login-submit" type="submit">
              Iniciar sesión
            </button>
            <p className="login-hint">Modo demostración: cualquier credencial permite entrar.</p>
          </form>
        </div>
      </main>
    </div>
  )
}

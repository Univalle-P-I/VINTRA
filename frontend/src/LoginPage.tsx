import { FormEvent, useState } from "react"

import BrandMark from "./BrandMark"
import "./login-page.css"

const accountTypes = [
  {
    title: "Administrador",
    description: "Panel administrativo.",
  },
  {
    title: "Conductor",
    description: "Su asignación y recorrido.",
  },
  {
    title: "Ciudadano",
    description: "Consultas y reportes.",
  },
]

function Logo() {
  return (
    <div className="login-logo" aria-label="VINTRA">
      <BrandMark className="login-logo-mark" />
      <span>VINTRA</span>
    </div>
  )
}

function AccountIcon({ title }: { title: string }) {
  return (
    <svg
      aria-hidden="true"
      className="account-icon-svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {title === "Administrador" ? (
        <path d="m12 3 7 3v5c0 4.4-2.8 7.8-7 10-4.2-2.2-7-5.6-7-10V6l7-3Z" />
      ) : title === "Conductor" ? (
        <>
          <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </>
      ) : (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-1a6 6 0 0 1 12 0v1H3ZM16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6V20h-3" />
        </>
      )}
    </svg>
  )
}

export default function LoginPage({
  onHome,
  onLogin,
}: {
  onHome: () => void
  onLogin: () => void
}) {
  const [email, setEmail] = useState("usuario.ejemplo@example.org")
  const [password, setPassword] = useState("vintra-demo")
  const [message, setMessage] = useState(
    "El usuario o la contraseña no coinciden. Revisa ambos campos e intenta de nuevo.",
  )

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      setMessage("Ingresa tu correo y contraseña para continuar.")

      return
    }

    setMessage("")

    onLogin()
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <button
          aria-label="Volver a la página de inicio"
          className="login-home-button"
          onClick={onHome}
          type="button"
        >
          <Logo />
        </button>
        <span>Consola municipal · Gestión de recolección · Buenaventura</span>
      </header>

      <main className="login-main">
        <div className="login-decoration login-decoration-left" />
        <div className="login-decoration login-decoration-right" />
        <section className="login-content">
          <div className="login-heading">
            <h1>Inicio de sesión</h1>
            <p>Accede a VINTRA · Gestión de recolección en Buenaventura.</p>
          </div>

          <div className="login-cards">
            <section className="login-card">
              <div className="login-card-heading">
                <div>
                  <h2>Acceso con credenciales</h2>
                  <p>
                    Ingresa el usuario o el correo y la contraseña de tu cuenta.
                  </p>
                </div>
              </div>
              <form className="login-form" onSubmit={submit}>
                <label className="login-field">
                  <span>Usuario o correo</span>
                  <input
                    autoComplete="username"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="usuario.ejemplo@example.org"
                    type="text"
                    value={email}
                  />
                </label>
                <label className="login-field">
                  <span>Contraseña</span>
                  <input
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ingresa tu contraseña"
                    type="password"
                    value={password}
                  />
                </label>
                {message && (
                  <p className="login-message" role="alert">
                    <strong>Credenciales incorrectas</strong>
                    {message}
                  </p>
                )}
                <button className="login-submit" type="submit">
                  Iniciar sesión
                </button>
                <p className="login-hint">
                  Datos ficticios de ejemplo · Contraseña simulada y oculta.
                </p>
              </form>
            </section>

            <section className="login-card login-account-card">
              <div className="login-card-heading">
                <div>
                  <h2>Acceso según tu cuenta</h2>
                  <p>
                    Al validar las credenciales, VINTRA identifica el rol de tu
                    cuenta y te dirige al área autorizada.
                  </p>
                </div>
              </div>
              <div className="account-list">
                {accountTypes.map((account) => (
                  <div className="account-option" key={account.title}>
                    <span className="account-icon" aria-hidden="true">
                      <AccountIcon title={account.title} />
                    </span>
                    <span className="account-copy">
                      <strong>{account.title}</strong>
                      <span>{account.description}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="account-note">
                Las funciones administrativas son exclusivas del Administrador;
                no están autorizadas para Conductor ni Ciudadano. Registrar o
                editar recolectores pertenece a Gestión de personal; no es un
                rol de acceso.
              </p>
            </section>
          </div>
          <p className="login-footer-note">
            VINTRA · Buenaventura · Información de ejemplo
          </p>
        </section>
      </main>
    </div>
  )
}

import { lazy, Suspense, useEffect, useState } from "react"
import type { CSSProperties, KeyboardEvent, ReactNode } from "react"

import BrandMark from "./BrandMark"
import { Icon } from "./ui"
import { CAN_MANAGE, navFor } from "./navigation"
import type { Role } from "./domain"
import { useReveal } from "./useReveal"
import HeroRoutes from "./HeroRoutes"

const LandingMap = lazy(() => import("./LandingMap"))

import "./landing-home.css"

const YEAR = new Date().getFullYear()

const steps = [
  {
    title: "Define las rutas",
    text: "Organiza macrorrutas y microrrutas por zonas de la ciudad.",
  },
  {
    title: "Asigna cada jornada",
    text: "Une una cuadrilla, una microrruta y un vehículo.",
  },
  {
    title: "Haz seguimiento",
    text: "Consulta el estado de cada recorrido sobre el mapa de Buenaventura.",
  },
]

type Profile = {
  role: Role
  label: string
  summary: string
  points: string[]
}

const profiles: Profile[] = [
  {
    role: "admin",
    label: "Administrador",
    summary: "Visión completa de la plataforma.",
    points: [
      "Gestiona flota, personal y rutas",
      "Identifica rápido lo que necesita atención",
      "Supervisa las asignaciones en el mapa",
    ],
  },
  {
    role: "ops",
    label: "Jefe de operaciones",
    summary: "Organiza y supervisa cada jornada.",
    points: [
      "Asigna cuadrilla, microrruta y vehículo",
      "Detecta cruces de horario",
      "Consulta flota, personal y rutas",
    ],
  },
  {
    role: "driver",
    label: "Conductor",
    summary: "Solo lo necesario para hacer su recorrido.",
    points: [
      "Ve su microrruta y su horario",
      "Identifica su vehículo",
      "Sin información administrativa",
    ],
  },
]

const MANAGED = new Set(["fleet", "people", "routes"])

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [ref, visible] = useReveal<HTMLDivElement>()
  return (
    <div
      className={`reveal${visible ? " is-visible" : ""} ${className}`.trim()}
      ref={ref}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

/** El mapa (y su descarga de calles) solo se carga cuando la sección entra en pantalla. */
function LiveMap() {
  const [ref, visible] = useReveal<HTMLDivElement>()
  return (
    <div className={`reveal${visible ? " is-visible" : ""}`} ref={ref}>
      {visible ? (
        <Suspense fallback={<div aria-busy="true" className="home-map-skeleton" />}>
          <LandingMap />
        </Suspense>
      ) : (
        <div className="home-map-skeleton" />
      )}
    </div>
  )
}

function Action({
  onClick,
  children,
  variant = "primary",
}: {
  onClick: () => void
  children: string
  variant?: "primary" | "secondary"
}) {
  return (
    <button
      className={`home-action home-action-${variant}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function ProfileTabs() {
  const [active, setActive] = useState<Role>("admin")
  const current = profiles.find((p) => p.role === active) ?? profiles[0]

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = profiles.findIndex((p) => p.role === active)
    let next = index
    if (event.key === "ArrowRight") next = (index + 1) % profiles.length
    else if (event.key === "ArrowLeft") next = (index - 1 + profiles.length) % profiles.length
    else return
    event.preventDefault()
    setActive(profiles[next].role)
    document.getElementById(`tab-${profiles[next].role}`)?.focus()
  }

  return (
    <div className="home-profiles">
      <div
        aria-label="Perfiles de usuario"
        className="home-tablist"
        onKeyDown={onKeyDown}
        role="tablist"
      >
        {profiles.map((p) => (
          <button
            aria-controls="profile-panel"
            aria-selected={p.role === active}
            className="home-tab"
            id={`tab-${p.role}`}
            key={p.role}
            onClick={() => setActive(p.role)}
            role="tab"
            tabIndex={p.role === active ? 0 : -1}
            type="button"
          >
            {p.label}
          </button>
        ))}
        <span aria-disabled="true" className="home-tab home-tab-soon">
          Ciudadano <em>Próximamente</em>
        </span>
      </div>

      <div
        aria-labelledby={`tab-${active}`}
        className="home-profile-panel"
        id="profile-panel"
        key={active}
        role="tabpanel"
      >
        <div className="home-profile-copy">
          <h3>{current.summary}</h3>
          <ul>
            {current.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div aria-label={`Menú que ve ${current.label}`} className="home-menu-card" role="group">
          <p>Lo que verá en su menú</p>
          <ul>
            {navFor(active).map((item, i) => (
              <li key={item.id} style={{ "--i": i } as CSSProperties}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {active === "ops" && MANAGED.has(item.id) && !CAN_MANAGE[item.id as "fleet"].includes(active) && (
                  <small>Solo consulta</small>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const solid = scrolled || menuOpen

  return (
    <div className="home-page">
      <header className="home-header" data-solid={solid}>
        <a aria-label="VINTRA, ir al inicio" className="home-brand" href="#inicio" onClick={closeMenu}>
          <BrandMark className="home-brand-mark" />
          <span>VINTRA</span>
        </a>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="home-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          aria-label="Navegación principal"
          className={menuOpen ? "home-navigation open" : "home-navigation"}
        >
          <a href="#inicio" onClick={closeMenu}>Inicio</a>
          <a href="#funciona" onClick={closeMenu}>Cómo funciona</a>
          <a href="#perfiles" onClick={closeMenu}>Perfiles</a>
          <a href="#contacto" onClick={closeMenu}>Contacto</a>
        </nav>
        <Action onClick={onLogin}>Iniciar sesión</Action>
      </header>

      <main>
        <section aria-labelledby="home-title" className="home-hero" id="inicio">
          <div className="home-hero-content">
            <p className="home-hero-badge">Proyecto piloto · Buenaventura, Valle del Cauca</p>
            <h1 id="home-title">Recolección de residuos, bajo control en Buenaventura</h1>
            <p className="home-hero-description">
              Organiza rutas, cuadrillas y vehículos en un solo lugar.
            </p>
            <div className="home-hero-actions">
              <Action onClick={onLogin}>Iniciar sesión</Action>
              <a className="home-action home-action-secondary" href="#funciona">
                Ver cómo funciona
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="home-hero-visual">
            <HeroRoutes />
          </div>
          <a aria-label="Ir a la siguiente sección" className="home-scroll-cue" href="#funciona">
            <span />
          </a>
        </section>

        <section aria-labelledby="steps-title" className="home-section" id="funciona">
          <Reveal className="home-heading">
            <h2 id="steps-title">Tres pasos para ordenar la recolección</h2>
          </Reveal>
          <ol className="home-steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 120}>
                  <span aria-hidden="true" className="home-step-number">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="map-title" className="home-section home-section-tint" id="mapa">
          <Reveal className="home-heading">
            <h2 id="map-title">Las rutas, sobre Buenaventura</h2>
            <p>Así se ve el seguimiento: cada camión recorre su ruta sobre el mapa.</p>
          </Reveal>
          <LiveMap />
        </section>

        <section aria-labelledby="profiles-title" className="home-section" id="perfiles">
          <Reveal className="home-heading">
            <h2 id="profiles-title">Cada perfil ve solo lo que necesita</h2>
            <p>Elige un perfil para ver cómo se organiza su menú.</p>
          </Reveal>
          <Reveal delay={100}>
            <ProfileTabs />
          </Reveal>
        </section>

        <section aria-labelledby="cta-title" className="home-cta">
          <Reveal className="home-cta-inner">
            <h2 id="cta-title">Empieza a organizar la recolección</h2>
            <Action onClick={onLogin}>Iniciar sesión</Action>
          </Reveal>
        </section>
      </main>

      <footer className="home-footer" id="contacto">
        <div className="home-footer-main">
          <a aria-label="VINTRA, ir al inicio" className="home-brand" href="#inicio">
            <BrandMark className="home-brand-mark" />
            <span>VINTRA</span>
          </a>
          <p>Gestión y seguimiento de la recolección de residuos sólidos en Buenaventura.</p>
          <div className="home-footer-contact">
            <a href="mailto:contacto@vintra.co">contacto@vintra.co</a>
            <span>Buenaventura, Valle del Cauca, Colombia</span>
          </div>
        </div>
        <p className="home-footer-bottom">© {YEAR} VINTRA</p>
      </footer>
    </div>
  )
}

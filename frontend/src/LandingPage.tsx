import { useState } from "react"

import BrandMark from "./BrandMark"

import "./landing-home.css"

const challenges = [
  {
    icon: "clock",

    title: "Retrasos en la recolección",

    description:
      "Los camiones no cumplen de manera regular con los horarios establecidos para cada sector.",
  },

  {
    icon: "signal",

    title: "Falta de información real",

    description:
      "Los ciudadanos desconocen el estado de las rutas y si el vehículo ya transitó por su área.",
  },

  {
    icon: "trash",

    title: "Acumulación de residuos",

    description:
      "Puntos críticos desatendidos generan acumulación de basura y focos de contaminación urbana.",
  },

  {
    icon: "pin",

    title: "Cobertura ineficiente",

    description:
      "Zonas periféricas del municipio quedan recurrentemente sin un servicio de recolección regular.",
  },
]

const features = [
  {
    icon: "map",

    title: "Gestión de Macrorutas",

    description: "Planificación óptima de rutas principales de recolección.",
  },

  {
    icon: "target",

    title: "Gestión de Microrutas",

    description: "Optimización de recorridos minuciosos dentro de cada zona.",
  },

  {
    icon: "truck",

    title: "Asignación de Vehículos",

    description: "Control y asignación eficiente de la flota según demanda.",
  },

  {
    icon: "pin",

    title: "Seguimiento GPS",

    description: "Monitoreo en tiempo real de cada vehículo recolector.",
  },

  {
    icon: "alert",

    title: "Registro de Incidencias",

    description: "Documentación de problemas surgidos durante el recorrido.",
  },

  {
    icon: "clock",

    title: "Consulta de Horarios",

    description: "Acceso inmediato para ciudadanos a los horarios de su zona.",
  },

  {
    icon: "route",

    title: "Consulta de Rutas",

    description:
      "Visualización interactiva de rutas asignadas y ya recorridas.",
  },

  {
    icon: "report",

    title: "Reporte de Residuos",

    description:
      "Canal directo para reportar fallas en la prestación del servicio.",
  },
]

const userModules = [
  {
    icon: "shield",

    title: "Administrador",

    color: "blue",

    actions: [
      "Crear rutas estratégicas",

      "Asignar conductores a flotas",

      "Gestionar y auditar vehículos",

      "Consultar y resolver incidencias",
    ],
  },

  {
    icon: "truck",

    title: "Conductor",

    color: "green",

    actions: [
      "Iniciar recorrido asignado",

      "Registrar ubicación GPS activa",

      "Visualizar estado vial de rutas",

      "Finalizar recorrido y reportar novedades",
    ],
  },

  {
    icon: "people",

    title: "Ciudadano",

    color: "orange",

    actions: [
      "Consultar horario de recolección",

      "Consultar trayecto de ruta local",

      "Reportar residuos no recogidos",

      "Consultar el estado del reporte",
    ],
  },
]

const benefits = [
  {
    icon: "bolt",

    title: "Mayor eficiencia operativa",

    description:
      "Optimización de recursos financieros, camiones y tiempos de recolección inteligente.",
  },

  {
    icon: "smile",

    title: "Menos acumulación de basura",

    description:
      "Atención inmediata a puntos críticos reportados directamente por el ciudadano.",
  },

  {
    icon: "clock",

    title: "Información en tiempo real",

    description:
      "Datos actualizados al minuto tanto para los coordinadores como para el vecindario.",
  },

  {
    icon: "message",

    title: "Participación ciudadana",

    description:
      "Canal bidireccional directo para el envío ágil de reportes, reclamos y consultas.",
  },
]

const iconPaths: Record<string, string> = {
  alert: "M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3h.01",

  bolt: "m13 2-3 8h6l-5 12 1-9H6l7-11Z",

  clock: "M12 8v4l2.5 1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",

  map: "M3 6.5 8 4l8 2.5L21 4v13.5L16 20l-8-2.5L3 20V6.5Zm5-2.5v13.5m8-11v13.5",

  message: "M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.4-3.4A7.5 7.5 0 1 1 20 11.5Z",

  people:
    "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20m7-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.7a4 4 0 0 1 0 7.4m1 4.2h1a3 3 0 0 1 3 3V20",

  pin: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",

  report: "M5 3h10l4 4v14H5V3Zm10 0v5h4m-10 4h6m-6 4h6",

  route:
    "M6 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm12 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM8 6.5h4a4 4 0 0 1 4 4v2a3 3 0 0 0 3 3.5",

  shield: "m12 3 7 3v5c0 4.4-2.8 7.8-7 10-4.2-2.2-7-5.6-7-10V6l7-3Z",

  signal: "M3 20h2v-3H3v3Zm5 0h2v-7H8v7Zm5 0h2V9h-2v11Zm5 0h2V4h-2v16Z",

  smile:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3-8a3.5 3.5 0 0 0 6 0m-5-4h.01M14 9h.01",

  target:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 3.5h.01",

  trash: "M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3",

  truck:
    "M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7Zm-7 9a2 2 0 1 0 0 .01M17 19a2 2 0 1 0 0 .01",
}

function Icon({
  name,

  className,
}: {
  name: string

  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

function LoginButton({
  onLogin,

  children,

  variant = "primary",
}: {
  onLogin: () => void

  children: string

  variant?: "primary" | "secondary"
}) {
  return (
    <button
      className={`home-action home-action-${variant}`}
      onClick={onLogin}
      type="button"
    >
      {children}
    </button>
  )
}

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="home-page">
      <header className="home-header">
        <a
          aria-label="VINTRA, ir al inicio"
          className="home-brand"
          href="#inicio"
          onClick={closeMenu}
        >
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
          <a href="#inicio" onClick={closeMenu}>
            Inicio
          </a>
          <a href="#funcionalidades" onClick={closeMenu}>
            Servicios
          </a>
          <a href="#reportes" onClick={closeMenu}>
            Reportes
          </a>
          <a href="#rutas" onClick={closeMenu}>
            Rutas
          </a>
          <a href="#contacto" onClick={closeMenu}>
            Contacto
          </a>
        </nav>
        <LoginButton onLogin={onLogin}>Iniciar Sesión</LoginButton>
      </header>

      <main>
        <section aria-labelledby="home-title" className="home-hero" id="inicio">
          <div className="home-hero-content">
            <p className="home-hero-badge">
              Proyecto piloto — Buenaventura, Colombia
            </p>
            <h1 id="home-title">
              Optimiza la recolección de residuos en Buenaventura
            </h1>
            <p className="home-hero-description">
              Consulta horarios, monitorea rutas en tiempo real y reporta
              incidencias desde cualquier lugar de manera rápida y transparente.
            </p>
            <div className="home-hero-actions">
              <LoginButton onLogin={onLogin}>Consultar Ruta</LoginButton>
              <LoginButton onLogin={onLogin} variant="secondary">
                Reportar Incidencia
              </LoginButton>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="challenge-title"
          className="home-section home-challenge"
          id="problema"
        >
          <div className="home-section-heading home-section-heading-left">
            <p className="home-eyebrow home-eyebrow-alert">El desafío urbano</p>
            <h2 id="challenge-title">Problema Actual</h2>
            <p>
              Buenaventura enfrenta desafíos críticos en la gestión de residuos
              sólidos que afectan la salud pública y el ecosistema.
            </p>
          </div>
          <div className="home-challenge-grid">
            {challenges.map((item) => (
              <article className="home-challenge-card" key={item.title}>
                <Icon className="home-challenge-icon" name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="features-title"
          className="home-section home-features"
          id="funcionalidades"
        >
          <div className="home-section-heading">
            <p className="home-eyebrow">Plataforma tecnológica</p>
            <h2 id="features-title">Funcionalidades del Sistema</h2>
            <p>
              Herramientas de software diseñadas para optimizar y auditar cada
              etapa del proceso de recolección de residuos.
            </p>
          </div>
          <div className="home-feature-grid">
            {features.map((item) => (
              <article className="home-feature-card" key={item.title}>
                <Icon className="home-feature-icon" name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="modules-title"
          className="home-section home-modules"
          id="reportes"
        >
          <div className="home-section-heading home-section-heading-left">
            <p className="home-eyebrow">Roles y accesibilidad</p>
            <h2 id="modules-title">Módulos según Tipo de Usuario</h2>
            <p>
              La plataforma se adapta a cada perfil de forma segura para
              garantizar flujos de trabajo claros e interactivos.
            </p>
          </div>
          <div className="home-module-grid">
            {userModules.map((module) => (
              <article
                className={`home-module-card home-module-${module.color}`}
                key={module.title}
              >
                <div className="home-module-title">
                  <Icon className="home-module-icon" name={module.icon} />
                  <h3>{module.title}</h3>
                </div>
                <ul>
                  {module.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="preview-title"
          className="home-section home-preview"
          id="rutas"
        >
          <div className="home-section-heading">
            <p className="home-eyebrow">Dashboard en acción</p>
            <h2 id="preview-title">Vista Previa del Sistema</h2>
            <p>
              Explora la interfaz de control cartográfico y analítica de datos
              en vivo de nuestra plataforma.
            </p>
          </div>
          <div className="home-preview-window">
            <div className="home-preview-bar">
              <span className="home-window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>vintra-app-console / Buenaventura-LiveMap</span>
              <span className="home-connected">Conectado</span>
            </div>
            <img
              alt="Vista cartográfica ilustrativa de vehículos, rutas e incidencias"
              className="home-preview-image"
              src="/assets/landing/764ea.png"
            />
            <aside className="home-preview-status">
              <h3>Estado General de Operación</h3>
              <div>
                <span>Micro rutas activas</span>
                <strong>14</strong>
              </div>
              <div>
                <span>Camiones en ruta</span>
                <strong>8 / 10</strong>
              </div>
              <div>
                <span>Reportes recientes</span>
                <strong className="home-status-alert">4 Pendientes</strong>
              </div>
              <div>
                <span>Eficiencia de cobertura</span>
                <strong className="home-status-blue">94.2%</strong>
              </div>
              <div className="home-progress">
                <span>Progreso de la jornada</span>
                <i>
                  <b />
                </i>
              </div>
            </aside>
          </div>
        </section>

        <section
          aria-labelledby="benefits-title"
          className="home-section home-benefits"
        >
          <div className="home-section-heading">
            <p className="home-eyebrow">Por qué VINTRA</p>
            <h2 id="benefits-title">Beneficios de VINTRA</h2>
          </div>
          <div className="home-benefit-grid">
            {benefits.map((item) => (
              <article className="home-benefit-card" key={item.title}>
                <Icon className="home-benefit-icon" name={item.icon} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-footer" id="contacto">
        <div className="home-footer-main">
          <div className="home-footer-brand-column">
            <a
              aria-label="VINTRA, ir al inicio"
              className="home-brand"
              href="#inicio"
            >
              <BrandMark className="home-brand-mark" />
              <span>VINTRA</span>
            </a>
            <p>
              Plataforma de gestión inteligente y optimización de residuos
              sólidos urbanos para Buenaventura.
            </p>
          </div>
          <div className="home-footer-column">
            <h2>Contacto</h2>
            <a href="mailto:contacto@vintra.co">contacto@vintra.co</a>
            <span>Buenaventura, Valle del Cauca, Colombia</span>
          </div>
          <div className="home-footer-column">
            <h2>Enlaces Rápidos</h2>
            <a href="#inicio">Inicio</a>
            <a href="#funcionalidades">Servicios</a>
            <a href="#reportes">Reportes</a>
            <a href="#rutas">Rutas</a>
          </div>
          <div className="home-footer-column home-social-column">
            <h2>Síguenos</h2>
            <div className="home-social-links">
              <a aria-label="Facebook" href="#contacto">
                f
              </a>
              <a aria-label="Twitter" href="#contacto">
                𝕏
              </a>
              <a aria-label="Instagram" href="#contacto">
                ◎
              </a>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>
            © 2025 VINTRA. Desarrollado con enfoque de sostenibilidad ambiental.
          </span>
          <span>Universidad de origen público y local</span>
        </div>
      </footer>
    </div>
  )
}

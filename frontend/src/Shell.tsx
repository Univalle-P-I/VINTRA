import { ReactNode } from "react"
import BrandMark from "./BrandMark"

export type Page = "panel" | "fleet" | "people" | "routes" | "operations"

export default function Shell({
  page,
  setPage,
  onHome,
  children,
}: {
  page: Page
  setPage: (page: Page) => void
  onHome: () => void
  children: ReactNode
}) {
  const items = [
    ["panel", "Panel administrativo"],
    ["fleet", "Gestión de flota"],
    ["people", "Gestión de personal"],
    ["routes", "Gestión de rutas"],
    ["operations", "Gestión de operación"],
  ] as const
  const pageTitle: Record<Page, string> = {
    panel: "Panel administrativo",
    fleet: "Gestión de flota",
    people: "Gestión de personal",
    routes: "Gestión de rutas",
    operations: "Gestión de operación",
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="identity">
          <button
            aria-label="Volver a la página de inicio"
            className="identity-brand"
            onClick={onHome}
            type="button"
          >
            <BrandMark className="identity-brand-mark" />
            <span>VINTRA</span>
          </button>
          <span>Consola municipal</span>
        </div>
        <nav aria-label="Navegación administrativa" className="nav-list">
          {items.map(([id, label]) => {
            return (
              <button
                aria-current={page === id ? "page" : undefined}
                className={page === id ? "nav-item active" : "nav-item"}
                key={id}
                onClick={() => setPage(id)}
                type="button"
              >
                {label}
              </button>
            )
          })}
        </nav>
        <p className="municipal-copy">
          Administración municipal
          <br />
          Gestión de recolección
        </p>
      </aside>

      <div className="workspace">
        <div className="mobile-header">
          <div className="identity">
            <button
              aria-label="Volver a la página de inicio"
              className="identity-brand"
              onClick={onHome}
              type="button"
            >
              <BrandMark className="identity-brand-mark" />
              <span>VINTRA</span>
            </button>
            <span>Consola municipal</span>
          </div>
          <div aria-label="Navegación administrativa" className="mobile-nav">
            {items.map(([id, label]) => (
              <button
                aria-current={page === id ? "page" : undefined}
                className={
                  page === id ? "mobile-nav-item active" : "mobile-nav-item"
                }
                key={id}
                onClick={() => setPage(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <header className="topbar">
          <span>Administración / {pageTitle[page]}</span>
        </header>
        {children}
      </div>
    </div>
  )
}

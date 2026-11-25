import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Logo } from "./BrandMark"
import { Icon } from "./ui"
import { ROLE_LABEL } from "./domain"
import type { Role } from "./domain"
import { navFor } from "./navigation"
import type { ScreenId } from "./navigation"

export default function AppShell({
  role, screen, onNavigate, onLogout, onHome, children,
}: {
  role: Role
  screen: ScreenId
  onNavigate: (id: ScreenId) => void
  onLogout: () => void
  onHome: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const items = navFor(role)
  const current = items.find((i) => i.id === screen)

  useEffect(() => {
    if (!open) return
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ) ?? [])
    focusable()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
        return
      }
      if (e.key !== "Tab") return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) { e.preventDefault(); return }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const closeDrawer = () => {
    setOpen(false)
    requestAnimationFrame(() => menuButtonRef.current?.focus())
  }
  const go = (id: ScreenId) => {
    setOpen(false)
    onNavigate(id)
    requestAnimationFrame(() => document.getElementById("contenido")?.focus())
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <aside aria-label="Navegación de módulos" aria-modal={open || undefined} className="sidebar" data-open={open} id="nav-drawer" ref={sidebarRef} role={open ? "dialog" : undefined}>
        <div>
          <button aria-label="VINTRA, ir al inicio" className="sidebar-brand" onClick={onHome} type="button">
            <Logo tone="light" />
          </button>
          <p className="sidebar-role">{ROLE_LABEL[role]}</p>
        </div>
        <nav aria-label="Navegación de módulos">
          <ul className="nav-list">
            {items.map((item) => (
              <li key={item.id}>
                <button aria-current={item.id === screen ? "page" : undefined} className="nav-item" onClick={() => go(item.id)} type="button">
                  <Icon name={item.icon} />{item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-foot">
          <button className="nav-item" onClick={onLogout} type="button"><Icon name="logout" />Cerrar sesión</button>
        </div>
      </aside>
      {open && <div aria-hidden="true" className="scrim" onClick={closeDrawer} />}

      <div className="workspace" inert={open}>
        <header className="topbar">
          <div className="topbar-left">
            <button aria-controls="nav-drawer" aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} className="button button-quiet menu-button" onClick={() => open ? closeDrawer() : setOpen(true)} ref={menuButtonRef} type="button">
              <Icon name="menu" />
            </button>
            <span className="topbar-brand"><Logo size="sm" tone="dark" /></span>
            <span className="topbar-context">Buenaventura · Recolección de residuos{current ? ` · ${current.label}` : ""}</span>
          </div>
          <div className="topbar-right">
            <span className="role-chip">{ROLE_LABEL[role]}</span>
          </div>
        </header>
        <main className="content" id="contenido" key={screen} tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}

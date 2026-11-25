import { useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"

/* ── Iconos (trazo, 24×24) ─────────────────────── */
const ICONS: Record<string, string> = {
  home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  truck: "M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 19.5a1.5 1.5 0 1 0 0-.01M18 19.5a1.5 1.5 0 1 0 0-.01",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-1a6 6 0 0 1 12 0v1zM16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6V20h-3",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6",
  clipboard: "M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h6",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 5 5 9-10",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
}

export function Icon({ name }: { name: keyof typeof ICONS | string }) {
  return (
    <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d={ICONS[name] ?? ""} />
    </svg>
  )
}

/* ── Acciones y campos ─────────────────────────── */
export function Button({
  children, onClick, primary = false, quiet = false, type = "button", disabled = false, icon,
}: {
  children: ReactNode
  onClick?: () => void
  primary?: boolean
  quiet?: boolean
  type?: "button" | "submit"
  disabled?: boolean
  icon?: string
}) {
  const cls = ["button", primary && "button-primary", quiet && "button-quiet"].filter(Boolean).join(" ")
  return (
    <button className={cls} disabled={disabled} onClick={onClick} type={type}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}

export function Field({
  label, value, onChange, placeholder, type = "text", hint, error, required, inputMode, step, autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  hint?: string
  error?: string
  required?: boolean
  inputMode?: "numeric" | "decimal" | "text"
  step?: string
  autoComplete?: string
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        id={id}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        step={step}
        type={type}
        value={value}
      />
      {error ? <span className="error-text" id={`${id}-e`}>{error}</span> : hint ? <span className="hint" id={`${id}-h`}>{hint}</span> : null}
    </div>
  )
}

export function SelectField({
  label, value, onChange, children, required, error,
}: { label: string; value: string; onChange: (value: string) => void; children: ReactNode; required?: boolean; error?: string }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select aria-describedby={error ? `${id}-e` : undefined} aria-invalid={error ? true : undefined} id={id} onChange={(event) => onChange(event.target.value)} required={required} value={value}>{children}</select>
      {error && <span className="error-text" id={`${id}-e`}>{error}</span>}
    </div>
  )
}

/* ── Estructura de página ──────────────────────── */
export function PageHeading({
  title, description, action,
}: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="page-head-row">
      <div className="page-heading">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function Section({
  title, subtitle, children, className = "",
}: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="section-heading">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

/** Cifra con cuenta progresiva suave; respeta prefers-reduced-motion. */
function useCountUp(target: number) {
  const instant =
    target === 0 ||
    typeof requestAnimationFrame !== "function" ||
    (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (instant) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 450)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [instant, target])
  return instant ? target : Math.round(target * progress)
}

export function Figure({
  label, value, note, lead = false,
}: { label: string; value: number; note?: string; lead?: boolean }) {
  const shown = useCountUp(value)
  return (
    <div className={lead ? "figure figure--lead" : "figure"}>
      <strong aria-label={`${label}: ${value}`}>{shown}</strong>
      <span>{label}</span>
      {note && <span className="figure-note">{note}</span>}
    </div>
  )
}

/* ── Estados con forma + texto ─────────────────── */
type Tone = "ok" | "info" | "warn" | "danger" | "neutral"
const SHAPES: Record<Tone, ReactNode> = {
  ok: <circle cx="5" cy="5" r="4" />,
  info: <rect height="8" rx="1" width="8" x="1" y="1" />,
  warn: <path d="M5 1 9.5 9h-9z" />,
  danger: <path d="m1 1 8 8M9 1 1 9" stroke="currentColor" strokeWidth="2" />,
  neutral: <circle cx="5" cy="5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />,
}
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`badge badge--${tone}`}>
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 10 10">{SHAPES[tone]}</svg>
      {children}
    </span>
  )
}

export function EmptyState({
  title, children, action,
}: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {children}
      {action}
    </div>
  )
}

/* ── Tabla accesible (se apila en móvil) ───────── */
export type Column<T> = { header: string; render: (row: T) => ReactNode; numeric?: boolean }

export function DataTable<T extends { id: string }>({
  caption, columns, rows, empty,
}: { caption: string; columns: Column<T>[]; rows: T[]; empty: ReactNode }) {
  if (!rows.length) return <>{empty}</>
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{columns.map((c) => <th className={c.numeric ? "num" : undefined} key={c.header} scope="col">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ animationDelay: `${Math.min(i, 8) * 24}ms` }}>
              {columns.map((c) => <td className={c.numeric ? "num" : undefined} data-label={c.header} key={c.header}>{c.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Modal con foco gestionado ─────────────────── */
export function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>("input, select, button")
    first?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeRef.current(); return }
      if (event.key !== "Tab" || !ref.current) return
      const items = ref.current.querySelectorAll<HTMLElement>("input, select, button, [href]")
      if (!items.length) return
      const a = items[0], z = items[items.length - 1]
      if (event.shiftKey && document.activeElement === a) { event.preventDefault(); z.focus() }
      else if (!event.shiftKey && document.activeElement === z) { event.preventDefault(); a.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("keydown", onKey); previous?.focus() }
  }, [])

  return (
    <div className="modal-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div aria-labelledby={titleId} aria-modal="true" className="modal" ref={ref} role="dialog">
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button aria-label="Cerrar" className="button button-quiet" onClick={onClose} type="button"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

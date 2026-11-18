import type { ReactNode } from "react"

export function Button({
  children,
  onClick,
  primary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  primary?: boolean
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      className={primary ? "button button-primary" : "button"}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  )
}

export function PageHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="page-heading">
      <p className="page-title">{title}</p>
      <p className="page-description">{description}</p>
      <p className="page-date">
         Buenaventura · Panel administrativo
      </p>
    </div>
  )
}

export function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  )
}

export function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="section-heading">
        <p className="section-title">{title}</p>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export function Footer() {
  return <footer>VINTRA · Vista administrativa</footer>
}

export function SchematicMap() {
  return (
    <div className="map-placeholder" role="status">
      Cartografía no disponible. La vista se habilitará al conectar datos geográficos reales.
    </div>
  )
}

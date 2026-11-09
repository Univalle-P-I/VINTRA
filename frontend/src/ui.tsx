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
  return <footer>VINTRA · Vista administrativa · Información de ejemplo</footer>
}

export function SchematicMap() {
  return (
    <div className="map">
      <span className="map-title">LA FLORESTA · SECTOR NORTE</span>
      {Array.from({ length: 8 }, (_, index) => (
        <span className={`block block-${index + 1}`} key={index} />
      ))}
      <img alt="" className="route" src="/assets/4e004.svg" />
      <img alt="" className="stop stop-a" src="/assets/32a05.svg" />
      <img alt="" className="stop stop-b" src="/assets/32a05.svg" />
      <img alt="" className="stop stop-c" src="/assets/32a05.svg" />
      <span className="vehicle-marker">V-018</span>
      <span className="map-start">● Inicio</span>
      <span className="map-end">◉ Fin</span>
    </div>
  )
}

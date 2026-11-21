import { useId } from "react"

const LEAF =
  "M19.5 4.5c-6.2 0-11.9 1.2-14.2 4.8-2.1 3.2-.4 7.2 3.5 7.2 4.8 0 8.6-5.2 10.7-12Z"
const VEIN = "M5.5 19c2.4-4 5.5-6.8 9.4-9"

/** Símbolo de VINTRA. La nervadura es un recorte real (máscara), por lo que
 *  funciona sobre cualquier fondo sin ajustar colores. Hereda `currentColor`. */
export default function BrandMark({ className }: { className?: string }) {
  const maskId = useId()

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect fill="#fff" height="24" width="24" />
          <path d={VEIN} stroke="#000" strokeLinecap="round" strokeWidth="1.6" />
        </mask>
      </defs>
      <path d={LEAF} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}

/** Símbolo + nombre. `tone="light"` para fondos oscuros (menú lateral). */
export function Logo({
  tone = "dark",
  size = "md",
}: {
  tone?: "light" | "dark"
  size?: "sm" | "md"
}) {
  return (
    <span aria-label="VINTRA" className={`logo logo--${tone} logo--${size}`} role="img">
      <BrandMark className="logo-mark" />
      <span aria-hidden="true" className="logo-word">
        VINTRA
      </span>
    </span>
  )
}

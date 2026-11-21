import { useEffect, useRef, useState } from "react"
import { EDGES, Fleet, H, NODES, PANELS, PT, TILT, W } from "./fleet"

/**
 * Animación decorativa de la portada: tres capas con calles esquemáticas donde
 * los camiones van de un punto a otro por su cuenta. No representa datos reales.
 */

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

type Routes = Record<string, { pts: string; target: string } | null>

export default function HeroRoutes() {
  const [reduce] = useState(prefersReducedMotion)
  const [fleet] = useState(() => new Fleet(performance.now() + 1500))
  const els = useRef<Record<string, SVGGElement | null>>({})
  const [routes, setRoutes] = useState<Routes>({})

  useEffect(() => {
    const place = (panelId: string) => {
      const t = fleet.trucks[panelId]
      const flip = Math.abs(t.angle) > 90 ? -1 : 1
      els.current[panelId]?.setAttribute(
        "transform",
        `translate(${t.pos.x.toFixed(1)} ${t.pos.y.toFixed(1)}) rotate(${t.angle.toFixed(0)}) scale(1 ${flip})`,
      )
    }
    for (const p of PANELS) place(p.id)
    if (reduce) return // Movimiento reducido: los camiones quedan quietos.

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      fleet.step(now, Math.min(0.05, (now - last) / 1000), {
        onArrive: (panel) => setRoutes((r) => ({ ...r, [panel.id]: null })),
        onPatrol: (panel) => {
          const target = fleet.randomTarget(panel.id)
          const pts = fleet.send(panel.id, target, now)
          if (pts) setRoutes((r) => ({ ...r, [panel.id]: { pts, target } }))
        },
      })
      last = now
      for (const p of PANELS) place(p.id)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fleet, reduce])

  return (
    <svg aria-hidden="true" className="hero-routes" focusable="false" viewBox="10 70 850 420">
      {PANELS.map((p, i) => (
        <g className="hero-layer" key={p.id} style={{ "--i": i } as React.CSSProperties}>
          <g transform={`translate(${p.x} ${p.y}) rotate(${TILT})`}>
            <rect className="sim-panel" height={H} rx="12" width={W} />
            {EDGES.map(([a, b]) => (
              <line className="sim-road-casing" key={`c-${a}-${b}`} x1={PT.get(a)?.x} x2={PT.get(b)?.x} y1={PT.get(a)?.y} y2={PT.get(b)?.y} />
            ))}
            {EDGES.map(([a, b]) => (
              <line className="sim-road" key={`r-${a}-${b}`} x1={PT.get(a)?.x} x2={PT.get(b)?.x} y1={PT.get(a)?.y} y2={PT.get(b)?.y} />
            ))}
            {routes[p.id] && <polyline className="sim-route" points={routes[p.id]?.pts} />}
            {NODES.map((n) => (
              <g className={`sim-node${routes[p.id]?.target === n.id ? " is-target" : ""}`} key={n.id} transform={`translate(${n.pt.x} ${n.pt.y})`}>
                <circle className="sim-node-ring" r="11" />
                <circle className="sim-node-dot" r="5" />
              </g>
            ))}
            <g className="sim-truck" ref={(el) => { els.current[p.id] = el }}>
              <rect className="sim-truck-body" height="15" rx="3" width="22" x="-15" y="-7.5" />
              <rect className="sim-truck-cab" height="12" rx="3" width="10" x="5" y="-6" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  )
}

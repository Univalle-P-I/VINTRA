import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { BUENAVENTURA_CENTER, OSM_ATTRIBUTION, OSM_URL } from "./mapData"
import { loadStreets } from "./loadStreets"
import { buildGraph, createRoutes, pointAt } from "./streets"
import type { SimRoute } from "./streets"

/**
 * Simulación ILUSTRATIVA sobre el mapa de Buenaventura: tres rutas de demostración,
 * generadas sobre calles reales de OpenStreetMap, con un camión que las recorre solo.
 * No son rutas ni vehículos operativos.
 */

const SPEED = 90 // metros por segundo (simulación acelerada)

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

const TRUCK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h11v9H2zM13 10h4l3 3v3h-7zM6 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01"/></svg>'

const truckIcon = (color: string) =>
  L.divIcon({
    className: "lm-marker",
    html: `<span class="lm-truck" style="--c:${color}">${TRUCK_SVG}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

type State = { status: "loading" | "ready" | "error"; routes: SimRoute[] }

export default function LandingMap() {
  const host = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [state, setState] = useState<State>({ status: "loading", routes: [] })
  const [attempt, setAttempt] = useState(0)
  const [reduce] = useState(prefersReducedMotion)

  // Mapa base de Buenaventura (una sola vez).
  useEffect(() => {
    if (!host.current) return
    const map = L.map(host.current, {
      center: BUENAVENTURA_CENTER,
      zoom: 14,
      minZoom: 11,
      scrollWheelZoom: false, // no secuestra el scroll de la página
      dragging: !L.Browser.mobile,
    })
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')
    L.tileLayer(OSM_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Calles reales → rutas de demostración.
  useEffect(() => {
    let cancelled = false
    loadStreets()
      .then((data) => {
        const routes = createRoutes(buildGraph(data), { center: BUENAVENTURA_CENTER })
        if (!cancelled) setState(routes.length ? { status: "ready", routes } : { status: "error", routes: [] })
      })
      .catch(() => { if (!cancelled) setState({ status: "error", routes: [] }) })
    return () => { cancelled = true }
  }, [attempt])

  // Dibujo de rutas y movimiento de los camiones.
  useEffect(() => {
    const map = mapRef.current
    if (!map || state.status !== "ready") return
    const group = L.layerGroup().addTo(map)
    const bounds = L.latLngBounds([])
    const markers = state.routes.map((route) => {
      L.polyline(route.path, { color: "#fff", weight: 10, opacity: 0.9, lineCap: "round", className: "lm-route" }).addTo(group)
      L.polyline(route.path, { color: route.color, weight: 5, opacity: 0.95, dashArray: route.dash ?? undefined, lineCap: "round", lineJoin: "round", className: "lm-route" }).addTo(group)
      route.path.forEach((p) => bounds.extend(p))
      return L.marker(route.path[0], { icon: truckIcon(route.color), keyboard: false, interactive: false }).addTo(group)
    })
    if (bounds.isValid() && map.getSize().x > 0) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 })

    if (reduce) return () => { map.removeLayer(group) } // Movimiento reducido: camiones quietos.

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const traveled = ((now - t0) / 1000) * SPEED
      state.routes.forEach((route, i) => markers[i].setLatLng(pointAt(route, traveled + i * route.length * 0.55)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); map.removeLayer(group) }
  }, [state, reduce])

  const retry = () => { setState({ status: "loading", routes: [] }); setAttempt((a) => a + 1) }

  return (
    <div className="lm">
      <div className="lm-stage">
        <div aria-label="Mapa de Buenaventura con rutas y camiones de demostración" className="lm-canvas" ref={host} role="region" />
        <span className="lm-badge">Simulación ilustrativa</span>
        {state.status === "loading" && (
          <div aria-busy="true" className="lm-overlay" role="status">Cargando las calles de Buenaventura…</div>
        )}
        {state.status === "error" && (
          <div className="lm-overlay" role="alert">
            <strong>No se pudieron cargar las calles.</strong>
            <span>El mapa base sigue disponible. Revisa tu conexión e inténtalo de nuevo.</span>
            <button className="home-action home-action-compact" onClick={retry} type="button">Reintentar</button>
          </div>
        )}
      </div>

      <ul aria-label="Leyenda del mapa" className="lm-legend">
        {state.routes.map((r) => (
          <li key={r.id}>
            <svg aria-hidden="true" height="10" viewBox="0 0 34 10" width="34">
              <line stroke={r.color} strokeDasharray={r.dash ?? undefined} strokeLinecap="round" strokeWidth="4" x1="3" x2="31" y1="5" y2="5" />
            </svg>
            <span>{r.name}</span>
            <small>{(r.length / 1000).toFixed(1).replace(".", ",")} km</small>
          </li>
        ))}
        {state.routes.length > 0 && <li className="lm-legend-note">Un camión por ruta, de ida y vuelta</li>}
      </ul>
      <p className="home-sim-note">Rutas y camiones de demostración sobre calles de OpenStreetMap, a velocidad acelerada. No representan la operación real.</p>
    </div>
  )
}

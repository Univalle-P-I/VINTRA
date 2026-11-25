import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import type { FeatureCollection } from "geojson"
import "leaflet/dist/leaflet.css"
import { Button } from "./ui"
import { BUENAVENTURA_CENTER, DEFAULT_ZOOM, NO_MAP_DATA, OSM_ATTRIBUTION, OSM_URL } from "./mapData"
import type { MapData } from "./mapData"

const PALETTE = ["#075c42", "#0b6b8a", "#8a5300", "#7a3b8f", "#a3262a", "#2f5d9e"]
type Selection = { kind: string; name: string; extra?: string }

export default function RouteMap({ data = NO_MAP_DATA, label = "Mapa de Buenaventura" }: { data?: MapData; label?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<Record<string, L.LayerGroup>>({})
  const [visible, setVisible] = useState({ macro: true, micro: true, barrios: true, pos: true })
  const [selected, setSelected] = useState<Selection | null>(null)

  const hasData = useMemo(
    () => data.macroroutes.features.length + data.microroutes.features.length + data.neighborhoods.features.length + data.positions.length > 0,
    [data],
  )

  // Mapa base: se crea una vez.
  useEffect(() => {
    if (!host.current) return
    const map = L.map(host.current, { center: BUENAVENTURA_CENTER, zoom: DEFAULT_ZOOM, minZoom: 9, zoomControl: true })
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')
    L.tileLayer(OSM_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map)
    mapRef.current = map
    layersRef.current = {
      barrios: L.layerGroup().addTo(map),
      macro: L.layerGroup().addTo(map),
      micro: L.layerGroup().addTo(map),
      pos: L.layerGroup().addTo(map),
    }
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Capas con datos.
  useEffect(() => {
    const layers = layersRef.current
    const map = mapRef.current
    if (!map || !layers.macro) return
    Object.values(layers).forEach((g) => g.clearLayers())
    const bounds = L.latLngBounds([])
    const pick = (kind: string) => (feature?: { properties?: Record<string, unknown> }, extra?: string) =>
      setSelected({ kind, name: String(feature?.properties?.name ?? "Sin nombre"), extra })

    const add = (group: L.LayerGroup, fc: FeatureCollection, kind: string, style: (i: number) => L.PathOptions) =>
      fc.features.forEach((f, i) => {
        const layer = L.geoJSON(f, { style: () => style(i) })
        layer.on("click", () => pick(kind)(f, String(f.properties?.detail ?? "")))
        layer.addTo(group)
        if (layer.getBounds().isValid()) bounds.extend(layer.getBounds())
      })

    add(layers.barrios, data.neighborhoods, "Barrio", () => ({ color: "#8a5300", dashArray: "4 4", fillOpacity: 0.12, weight: 1.5 }))
    add(layers.macro, data.macroroutes, "Macrorruta", () => ({ color: "#0b6b8a", fillOpacity: 0.12, weight: 2 }))
    add(layers.micro, data.microroutes, "Microrruta", (i) => ({ color: PALETTE[i % PALETTE.length], weight: 4 }))
    data.positions.forEach((p) => {
      const m = L.circleMarker([p.lat, p.lng], { color: "#fff", fillColor: "#a3262a", fillOpacity: 1, radius: 8, weight: 2 })
      m.on("click", () => setSelected({
        kind: "Posición de una asignación",
        name: p.vehiclePlate ? `Vehículo ${p.vehiclePlate}` : `Asignación ${p.assignmentId}`,
        extra: [p.microrouteName, new Date(p.recordedAt).toLocaleString("es-CO")].filter(Boolean).join(" · "),
      }))
      m.addTo(layers.pos)
      bounds.extend([p.lat, p.lng])
    })
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32] })
  }, [data])

  // Visibilidad de capas.
  useEffect(() => {
    const map = mapRef.current
    const layers = layersRef.current
    if (!map) return
    const set = (key: keyof typeof visible, group: L.LayerGroup | undefined) => {
      if (!group) return
      if (visible[key] && !map.hasLayer(group)) group.addTo(map)
      if (!visible[key] && map.hasLayer(group)) map.removeLayer(group)
    }
    set("macro", layers.macro); set("micro", layers.micro); set("barrios", layers.barrios); set("pos", layers.pos)
  }, [visible])

  const toggle = (key: keyof typeof visible, text: string) => (
    <label className="map-toggle">
      <input checked={visible[key]} onChange={(e) => setVisible((v) => ({ ...v, [key]: e.target.checked }))} type="checkbox" />
      {text}
    </label>
  )

  return (
    <div className="map-card">
      <div className="map-toolbar">
        {toggle("macro", "Macrorrutas")}
        {toggle("micro", "Microrrutas")}
        {toggle("barrios", "Barrios")}
        {toggle("pos", "Posiciones")}
        <Button quiet onClick={() => mapRef.current?.setView(BUENAVENTURA_CENTER, DEFAULT_ZOOM)}>Centrar en Buenaventura</Button>
      </div>
      <div className="map-stage">
        <div aria-label={label} className="map-canvas" ref={host} role="region" />
        {!hasData && (
          <div className="map-empty" role="note">
            <strong>Aún no hay rutas ni posiciones para dibujar</strong>
            <span className="muted">El mapa base es real; las capas operativas se activan cuando el sistema entregue:</span>
            <ul>
              <li>Geometría de macrorrutas y microrrutas</li>
              <li>Geometría de barrios y su orden de visita</li>
              <li>Posiciones registradas durante asignaciones</li>
            </ul>
          </div>
        )}
      </div>
      <div className="map-legend" aria-label="Leyenda del mapa">
        <span><i className="swatch swatch--macro" />Macrorruta (zona)</span>
        <span><i className="swatch swatch--micro" />Microrruta (un color por recorrido)</span>
        <span><i className="swatch swatch--barrio" />Barrio atendido</span>
        <span><i className="swatch swatch--pos" />Posición registrada</span>
      </div>
      {selected && (
        <div className="map-detail" role="status">
          <strong>{selected.name}</strong> <span className="muted">· {selected.kind}</span>
          {selected.extra && <p className="muted">{selected.extra}</p>}
        </div>
      )}
    </div>
  )
}

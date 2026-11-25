import { lazy, Suspense } from "react"
import type { MapData } from "./mapData"

const RouteMap = lazy(() => import("./RouteMap"))

/** Carga diferida del mapa: Leaflet solo se descarga cuando se muestra. */
export default function MapView({ data, label }: { data?: MapData; label?: string }) {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Cargando mapa" className="skeleton" style={{ height: 360 }} />}>
      <RouteMap data={data} label={label} />
    </Suspense>
  )
}

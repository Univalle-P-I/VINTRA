import type { FeatureCollection } from "geojson"

/** Centro aproximado de Buenaventura, Valle del Cauca (EPSG:4326). */
export const BUENAVENTURA_CENTER: [number, number] = [3.8801, -77.0312]
export const DEFAULT_ZOOM = 13
export const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">Colaboradores de OpenStreetMap</a>'

export const emptyCollection: FeatureCollection = { type: "FeatureCollection", features: [] }

/** `vehicle_position` referencia una asignación; ruta y vehículo se obtienen al resolver esa relación. */
export type PositionPoint = {
  id: string
  assignmentId: string
  lat: number
  lng: number
  recordedAt: string
  vehiclePlate?: string
  microrouteName?: string
}

/** Geometrías que la API entrega desde macroroute, microroute y btura_neighborhood. */
export type MapData = {
  macroroutes: FeatureCollection
  microroutes: FeatureCollection
  neighborhoods: FeatureCollection
  positions: PositionPoint[]
}
export const NO_MAP_DATA: MapData = {
  macroroutes: emptyCollection,
  microroutes: emptyCollection,
  neighborhoods: emptyCollection,
  positions: [],
}


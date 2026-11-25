import type { OverpassResponse } from "../streets"

/** Red de calles sintética con la misma forma que devuelve Overpass (`out geom`). Solo para pruebas. */
export function makeStreetSample(center: [number, number] = [3.8801, -77.0312], rows = 11, cols = 13, spacing = 90): OverpassResponse {
  const id = (r: number, c: number) => r * 100 + c + 1
  const lat = (r: number) => center[0] + ((r - rows / 2) * spacing) / 110574 + (r % 3) * 0.00002
  const lon = (c: number) => center[1] + ((c - cols / 2) * spacing) / 111320 + (c % 2) * 0.00002
  const elements: OverpassResponse["elements"] = []
  for (let r = 0; r < rows; r++) {
    const cs = Array.from({ length: cols }, (_, c) => c)
    elements.push({ type: "way", id: 1000 + r, nodes: cs.map((c) => id(r, c)), geometry: cs.map((c) => ({ lat: lat(r), lon: lon(c) })) })
  }
  for (let c = 0; c < cols; c += 2) {
    const rs = Array.from({ length: rows }, (_, r) => r)
    elements.push({ type: "way", id: 2000 + c, nodes: rs.map((r) => id(r, c)), geometry: rs.map((r) => ({ lat: lat(r), lon: lon(c) })) })
  }
  // Una calle aislada que debe descartarse (no conecta con la red principal).
  elements.push({ type: "way", id: 9, nodes: [900001, 900002], geometry: [{ lat: 3.89, lon: -77.02 }, { lat: 3.8901, lon: -77.0201 }] })
  return { elements }
}

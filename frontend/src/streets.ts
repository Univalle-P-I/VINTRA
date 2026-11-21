/**
 * Calles reales de Buenaventura (OpenStreetMap) y rutas de DEMOSTRACIÓN generadas
 * sobre ellas para la simulación de la landing. Las rutas no son operativas.
 */

export type LatLng = [number, number]

/** Forma mínima de la respuesta de Overpass con `out geom`. */
export type OverpassWay = { type?: string; id?: number; nodes?: number[]; geometry?: { lat: number; lon: number }[] }
export type OverpassResponse = { elements: OverpassWay[] }

/** Zona del casco urbano que se consulta (aproximada). */
export const STREETS_BBOX = { south: 3.868, west: -77.045, north: 3.892, east: -77.018 }

export const overpassQuery = ({ south, west, north, east } = STREETS_BBOX) =>
  `[out:json][timeout:25];way["highway"~"^(primary|secondary|tertiary|unclassified|residential|living_street)$"](${south},${west},${north},${east});out geom qt;`

const M_LAT = 110574
const M_LON = 111320

/** Distancia en metros (aproximación plana, suficiente a esta escala). */
export function distance(a: LatLng, b: LatLng): number {
  const dy = (b[0] - a[0]) * M_LAT
  const dx = (b[1] - a[1]) * M_LON * Math.cos((((a[0] + b[0]) / 2) * Math.PI) / 180)
  return Math.hypot(dx, dy)
}

export type StreetGraph = { coords: Map<number, LatLng>; adj: Map<number, number[]> }

/** Construye el grafo de calles y conserva solo su componente conexa más grande. */
export function buildGraph(data: OverpassResponse): StreetGraph {
  const coords = new Map<number, LatLng>()
  const adj = new Map<number, Set<number>>()
  const connect = (a: number, b: number) => {
    if (a === b) return
    ;(adj.get(a) ?? adj.set(a, new Set()).get(a))?.add(b)
    ;(adj.get(b) ?? adj.set(b, new Set()).get(b))?.add(a)
  }

  for (const way of data.elements ?? []) {
    const { nodes, geometry } = way
    if (!nodes || !geometry || nodes.length !== geometry.length) continue
    nodes.forEach((id, i) => coords.set(id, [geometry[i].lat, geometry[i].lon]))
    for (let i = 1; i < nodes.length; i++) connect(nodes[i - 1], nodes[i])
  }

  // Componente conexa más grande: así los camiones nunca quedan en una calle aislada.
  const seen = new Set<number>()
  let best: number[] = []
  for (const start of adj.keys()) {
    if (seen.has(start)) continue
    const comp: number[] = []
    const stack = [start]
    seen.add(start)
    while (stack.length) {
      const cur = stack.pop() as number
      comp.push(cur)
      for (const next of adj.get(cur) ?? []) if (!seen.has(next)) { seen.add(next); stack.push(next) }
    }
    if (comp.length > best.length) best = comp
  }
  const keep = new Set(best)
  const outAdj = new Map<number, number[]>()
  const outCoords = new Map<number, LatLng>()
  for (const id of keep) {
    outAdj.set(id, [...(adj.get(id) ?? [])].filter((n) => keep.has(n)))
    outCoords.set(id, coords.get(id) as LatLng)
  }
  return { coords: outCoords, adj: outAdj }
}

export function nearestNode(graph: StreetGraph, point: LatLng): number | null {
  let best: number | null = null
  let bestD = Infinity
  for (const [id, c] of graph.coords) {
    const d = distance(point, c)
    if (d < bestD) { bestD = d; best = id }
  }
  return best
}

/** Generador pseudoaleatorio con semilla: las rutas son las mismas en cada carga. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type SimRoute = {
  id: string
  name: string
  color: string
  dash: string | null
  path: LatLng[]
  cum: number[]
  length: number
}

export const ROUTE_STYLES = [
  { id: "A", color: "#075c42", dash: null },
  { id: "B", color: "#0b6b8a", dash: "12 9" },
  { id: "C", color: "#b4470f", dash: "2 10" },
] as const

const heading = (a: LatLng, b: LatLng) =>
  (Math.atan2((b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180), b[0] - a[0]) * 180) / Math.PI

const angleDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Recorrido aleatorio que tiende a seguir derecho, como una ruta de recolección. */
function walk(graph: StreetGraph, start: number, target: number, rnd: () => number): number[] {
  const path = [start]
  const visited = new Set([start])
  let meters = 0
  for (let step = 0; step < 800 && meters < target; step++) {
    const cur = path[path.length - 1]
    const options = (graph.adj.get(cur) ?? []).filter((n) => !visited.has(n))
    if (!options.length) break
    const here = graph.coords.get(cur) as LatLng
    const prev = path.length > 1 ? (graph.coords.get(path[path.length - 2]) as LatLng) : null
    const weights = options.map((n) => {
      if (!prev) return 1
      const diff = angleDiff(heading(prev, here), heading(here, graph.coords.get(n) as LatLng))
      return Math.exp(-((diff / 55) ** 2)) + 0.04
    })
    let r = rnd() * weights.reduce((s, w) => s + w, 0)
    let pick = options[options.length - 1]
    for (let i = 0; i < options.length; i++) {
      r -= weights[i]
      if (r <= 0) { pick = options[i]; break }
    }
    meters += distance(here, graph.coords.get(pick) as LatLng)
    visited.add(pick)
    path.push(pick)
  }
  return path
}

export function createRoutes(
  graph: StreetGraph,
  { center, targetMeters = 1800, seed = 11 }: { center: LatLng; targetMeters?: number; seed?: number },
): SimRoute[] {
  const rnd = mulberry32(seed)
  const routes: SimRoute[] = []
  ROUTE_STYLES.forEach((style, k) => {
    const bearing = ((k * 120 + 25) * Math.PI) / 180
    const origin: LatLng = [
      center[0] + (Math.cos(bearing) * 550) / M_LAT,
      center[1] + (Math.sin(bearing) * 550) / (M_LON * Math.cos((center[0] * Math.PI) / 180)),
    ]
    const start = nearestNode(graph, origin)
    if (start === null) return

    let best: number[] = []
    let bestLen = 0
    for (let attempt = 0; attempt < 14; attempt++) {
      const ids = walk(graph, start, targetMeters, rnd)
      const pts = ids.map((id) => graph.coords.get(id) as LatLng)
      const len = pts.reduce((s, p, i) => (i ? s + distance(pts[i - 1], p) : 0), 0)
      if (len > bestLen) { best = ids; bestLen = len }
      if (len >= targetMeters * 0.8) break
    }
    if (best.length < 2) return

    const path = best.map((id) => graph.coords.get(id) as LatLng)
    const cum = [0]
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + distance(path[i - 1], path[i]))
    routes.push({ id: style.id, name: `Ruta ${style.id}`, color: style.color, dash: style.dash, path, cum, length: cum[cum.length - 1] })
  })
  return routes
}

/** Posición a `d` metros del inicio; al llegar al final el camión regresa (ida y vuelta). */
export function pointAt(route: SimRoute, d: number): LatLng {
  const L = route.length
  const m = ((d % (2 * L)) + 2 * L) % (2 * L)
  const dist = m <= L ? m : 2 * L - m
  let s = 0
  while (s < route.cum.length - 2 && dist >= route.cum[s + 1]) s++
  const a = route.path[s]
  const b = route.path[s + 1]
  const f = (dist - route.cum[s]) / (route.cum[s + 1] - route.cum[s] || 1)
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
}

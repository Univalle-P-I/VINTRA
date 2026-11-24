/**
 * Motor de la simulación ILUSTRATIVA de la landing: tres zonas esquemáticas con
 * calles y un camión por zona. No usa datos reales ni coordenadas de Buenaventura.
 */

export const COLS = 4
export const ROWS = 3
export const W = 380
export const H = 190
export const TILT = 3.5
export const SPEED = 120 // unidades del dibujo por segundo

export type Pt = { x: number; y: number }
export type PanelDef = { id: string; name: string; x: number; y: number; tint: string; start: [number, number] }

export const PANELS: PanelDef[] = [
  { id: "A", name: "Zona 1", x: 30, y: 250, tint: "#e4f1ea", start: [0, 2] },
  { id: "B", name: "Zona 2", x: 240, y: 170, tint: "#e1f0f5", start: [3, 0] },
  { id: "C", name: "Zona 3", x: 450, y: 90, tint: "#fbefd2", start: [0, 0] },
]

const nodeId = (i: number, j: number) => `${j * COLS + i + 1}`

export type GraphNode = { id: string; pt: Pt }
export const NODES: GraphNode[] = []
export const EDGES: [string, string][] = []
const ADJ = new Map<string, string[]>()

for (let j = 0; j < ROWS; j++)
  for (let i = 0; i < COLS; i++) NODES.push({ id: nodeId(i, j), pt: { x: 46 + i * 96, y: 58 + j * 54 } })

const link = (a: string, b: string) => {
  EDGES.push([a, b])
  ADJ.set(a, [...(ADJ.get(a) ?? []), b])
  ADJ.set(b, [...(ADJ.get(b) ?? []), a])
}
for (let j = 0; j < ROWS; j++)
  for (let i = 0; i < COLS; i++) {
    if (i < COLS - 1) link(nodeId(i, j), nodeId(i + 1, j))
    // Dos calles sin conexión vertical: la red no es una cuadrícula perfecta.
    const skip = (i === 1 && j === 0) || (i === 2 && j === 1)
    if (j < ROWS - 1 && !skip) link(nodeId(i, j), nodeId(i, j + 1))
  }

export const PT = new Map(NODES.map((n) => [n.id, n.pt]))
const at = (id: string) => PT.get(id) as Pt

export function shortestPath(from: string, to: string): string[] {
  if (from === to) return [from]
  const prev = new Map<string, string>([[from, from]])
  const queue = [from]
  while (queue.length) {
    const cur = queue.shift() as string
    for (const next of ADJ.get(cur) ?? []) {
      if (prev.has(next)) continue
      prev.set(next, cur)
      if (next === to) {
        const path = [to]
        let node = to
        while (node !== from) {
          node = prev.get(node) as string
          path.unshift(node)
        }
        return path
      }
      queue.push(next)
    }
  }
  return [from]
}

export type Truck = {
  node: string
  pos: Pt
  angle: number
  pts: Pt[]
  ids: (string | null)[]
  cum: number[]
  traveled: number
  moving: boolean
  target: string | null
  idleUntil: number
}

const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y)
const segmentAt = (t: Truck) => {
  let s = 0
  while (s < t.cum.length - 2 && t.traveled >= t.cum[s + 1]) s++
  return s
}

export type Handlers = {
  onArrive: (panel: PanelDef, node: string) => void
  onPatrol: (panel: PanelDef) => void
}

export class Fleet {
  trucks: Record<string, Truck> = {}

  /** `startAt`: instante (ms) a partir del cual los camiones empiezan a moverse; cada zona arranca un poco después. */
  constructor(startAt = 0) {
    for (const [k, p] of PANELS.entries()) {
      const id = nodeId(p.start[0], p.start[1])
      this.trucks[p.id] = {
        node: id, pos: at(id), angle: 0, pts: [], ids: [], cum: [], traveled: 0,
        moving: false, target: null, idleUntil: startAt + k * 380,
      }
    }
  }

  /** Envía el camión de una zona a un punto. Devuelve la ruta para dibujarla, o null si ya está allí. */
  send(panelId: string, target: string, now: number): string | null {
    const t = this.trucks[panelId]
    if (t.node === target && !t.moving) return null

    let heading = t.node
    const pts: Pt[] = [t.pos]
    const ids: (string | null)[] = [t.node]
    if (t.moving) {
      // En marcha: seguir hasta el próximo cruce y desde allí tomar la nueva ruta.
      heading = (t.ids[segmentAt(t) + 1] as string) ?? t.node
      ids[0] = null
      pts.push(at(heading))
      ids.push(heading)
    }
    shortestPath(heading, target).forEach((n, k) => {
      if (k === 0 && pts.length > 1) return
      const pt = at(n)
      const last = pts[pts.length - 1]
      if (last.x === pt.x && last.y === pt.y) return
      pts.push(pt)
      ids.push(n)
    })
    const cum = [0]
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + dist(pts[k - 1], pts[k]))
    Object.assign(t, { pts, ids, cum, traveled: 0, moving: pts.length > 1, target, idleUntil: now })
    return pts.map((p) => `${p.x},${p.y}`).join(" ")
  }

  /** Avanza la simulación `dt` segundos. */
  step(now: number, dt: number, handlers: Handlers) {
    for (const panel of PANELS) {
      const t = this.trucks[panel.id]
      if (t.moving) {
        t.traveled += SPEED * dt
        if (t.traveled >= t.cum[t.cum.length - 1]) {
          Object.assign(t, {
            moving: false, node: t.target as string, pos: at(t.target as string),
            idleUntil: now + 600 + Math.random() * 900,
          })
          handlers.onArrive(panel, t.node)
        } else {
          const s = segmentAt(t)
          const a = t.pts[s]
          const b = t.pts[s + 1]
          const f = (t.traveled - t.cum[s]) / (t.cum[s + 1] - t.cum[s] || 1)
          t.pos = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
          t.angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        }
      } else if (now > t.idleUntil) {
        handlers.onPatrol(panel)
      }
    }
  }

  /** Punto aleatorio distinto del actual. */
  randomTarget(panelId: string): string {
    const t = this.trucks[panelId]
    const options = NODES.filter((n) => n.id !== t.node)
    return options[Math.floor(Math.random() * options.length)].id
  }
}

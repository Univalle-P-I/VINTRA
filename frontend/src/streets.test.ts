import { describe, expect, it } from "vitest"
import { buildGraph, createRoutes, distance, nearestNode, overpassQuery, pointAt, STREETS_BBOX } from "./streets"
import { BUENAVENTURA_CENTER } from "./mapData"
import { makeStreetSample } from "./test/streetSample"

const graph = buildGraph(makeStreetSample())

describe("buildGraph", () => {
  it("conserva solo la red principal y descarta calles aisladas", () => {
    expect(graph.coords.has(900001)).toBe(false)
    expect(graph.coords.size).toBeGreaterThan(100)
  })

  it("ignora vías sin geometría o con datos inconsistentes", () => {
    const g = buildGraph({ elements: [{ nodes: [1, 2] }, { nodes: [1, 2, 3], geometry: [{ lat: 1, lon: 1 }] }] })
    expect(g.coords.size).toBe(0)
  })

  it("cada punto de la red tiene vecinos que también están en la red", () => {
    for (const [id, neighbours] of graph.adj) {
      expect(neighbours.length).toBeGreaterThan(0)
      neighbours.forEach((n) => expect(graph.coords.has(n)).toBe(true))
      expect(graph.coords.has(id)).toBe(true)
    }
  })
})

describe("overpassQuery", () => {
  it("consulta solo vías transitables dentro de la zona de Buenaventura", () => {
    const q = overpassQuery()
    expect(q).toContain("highway")
    expect(q).toContain(`${STREETS_BBOX.south},${STREETS_BBOX.west},${STREETS_BBOX.north},${STREETS_BBOX.east}`)
    expect(q).not.toContain("footway")
  })
})

describe("createRoutes", () => {
  const routes = createRoutes(graph, { center: BUENAVENTURA_CENTER })

  it("genera tres rutas diferenciadas por color y trazo, no solo por color", () => {
    expect(routes.map((r) => r.id)).toEqual(["A", "B", "C"])
    expect(new Set(routes.map((r) => r.color)).size).toBe(3)
    expect(new Set(routes.map((r) => r.dash)).size).toBe(3)
  })

  it("recorre únicamente puntos de la red de calles, con longitud razonable", () => {
    const known = new Set([...graph.coords.values()].map((c) => c.join(",")))
    for (const r of routes) {
      r.path.forEach((p) => expect(known.has(p.join(","))).toBe(true))
      expect(r.length).toBeGreaterThan(800)
      expect(r.cum[r.cum.length - 1]).toBeCloseTo(r.length, 5)
    }
  })

  it("es determinista: las mismas calles dan las mismas rutas", () => {
    const again = createRoutes(graph, { center: BUENAVENTURA_CENTER })
    expect(again.map((r) => r.path)).toEqual(routes.map((r) => r.path))
  })

  it("no genera rutas si no hay calles", () => {
    expect(createRoutes(buildGraph({ elements: [] }), { center: BUENAVENTURA_CENTER })).toEqual([])
  })
})

describe("pointAt", () => {
  const [route] = createRoutes(graph, { center: BUENAVENTURA_CENTER })

  it("empieza en el origen, llega al final y regresa (ida y vuelta)", () => {
    expect(pointAt(route, 0)).toEqual(route.path[0])
    const end = pointAt(route, route.length)
    expect(distance(end, route.path[route.path.length - 1])).toBeLessThan(0.01)
    expect(distance(pointAt(route, route.length * 2), route.path[0])).toBeLessThan(0.01)
    expect(distance(pointAt(route, route.length * 1.5), pointAt(route, route.length * 0.5))).toBeLessThan(0.01)
  })

  it("avanza de forma continua sobre la ruta", () => {
    let prev = pointAt(route, 0)
    for (let d = 10; d < route.length; d += 10) {
      const p = pointAt(route, d)
      expect(distance(prev, p)).toBeLessThan(12)
      prev = p
    }
  })
})

describe("nearestNode", () => {
  it("devuelve el punto de la red más cercano", () => {
    const id = nearestNode(graph, BUENAVENTURA_CENTER) as number
    expect(distance(graph.coords.get(id) as [number, number], BUENAVENTURA_CENTER)).toBeLessThan(120)
  })
})

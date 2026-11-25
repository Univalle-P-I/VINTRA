import { describe, expect, it } from "vitest"
import { EDGES, Fleet, NODES, PANELS, shortestPath } from "./fleet"

const noop = { onArrive: () => {}, onPatrol: () => {} }

describe("red de calles de la simulación", () => {
  it("todas las calles unen puntos existentes y la red es conexa", () => {
    const ids = new Set(NODES.map((n) => n.id))
    EDGES.forEach(([a, b]) => expect(ids.has(a) && ids.has(b)).toBe(true))
    NODES.forEach((n) => expect(shortestPath(NODES[0].id, n.id).at(-1)).toBe(n.id))
  })

  it("el camino más corto empieza y termina donde corresponde", () => {
    const path = shortestPath("1", "12")
    expect(path[0]).toBe("1")
    expect(path.at(-1)).toBe("12")
  })
})

describe("Fleet", () => {
  it("no hace nada si el camión ya está en el punto", () => {
    const fleet = new Fleet()
    const t = fleet.trucks[PANELS[0].id]
    expect(fleet.send(PANELS[0].id, t.node, 0)).toBeNull()
  })

  it("lleva el camión al punto elegido por las calles", () => {
    const fleet = new Fleet()
    const id = PANELS[1].id
    const target = fleet.randomTarget(id)
    const route = fleet.send(id, target, 0)

    expect(route).toContain(",")
    expect(fleet.trucks[id].moving).toBe(true)

    const arrivals: string[] = []
    for (let now = 0; now < 20000 && fleet.trucks[id].moving; now += 50) {
      fleet.step(now, 0.05, { onArrive: (_, node) => arrivals.push(node), onPatrol: () => {} })
    }
    expect(fleet.trucks[id].moving).toBe(false)
    expect(fleet.trucks[id].node).toBe(target)
    expect(arrivals).toContain(target)
  })

  it("permite cambiar de destino con el camión en marcha", () => {
    const fleet = new Fleet()
    const id = PANELS[2].id
    fleet.send(id, "12", 0)
    for (let i = 0; i < 6; i++) fleet.step(i * 50, 0.05, noop)

    fleet.send(id, "4", 300)
    for (let now = 350; now < 30000 && fleet.trucks[id].moving; now += 50) fleet.step(now, 0.05, noop)

    expect(fleet.trucks[id].node).toBe("4")
  })

  it("pide patrullar cuando un camión lleva un rato quieto", () => {
    const fleet = new Fleet()
    const patrol: string[] = []
    fleet.step(5000, 0.05, { onArrive: () => {}, onPatrol: (p) => patrol.push(p.id) })
    expect(patrol).toEqual(PANELS.map((p) => p.id))
  })

  it("arranca los camiones de forma escalonada después del retraso inicial", () => {
    const fleet = new Fleet(2000)
    const patrol: string[] = []
    const handlers = { onArrive: () => {}, onPatrol: (p: { id: string }) => patrol.push(p.id) }

    fleet.step(1500, 0.05, handlers)
    expect(patrol).toEqual([])

    fleet.step(2100, 0.05, handlers)
    expect(patrol).toEqual([PANELS[0].id])

    fleet.step(2900, 0.05, handlers)
    expect(patrol).toContain(PANELS[2].id)
  })
})

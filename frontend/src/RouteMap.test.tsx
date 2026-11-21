import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import RouteMap from "./RouteMap"
import { BUENAVENTURA_CENTER, NO_MAP_DATA } from "./mapData"
import type { MapData } from "./mapData"

describe("RouteMap", () => {
  it("centra el mapa base en Buenaventura", () => {
    expect(BUENAVENTURA_CENTER[0]).toBeCloseTo(3.88, 1)
    expect(BUENAVENTURA_CENTER[1]).toBeCloseTo(-77.03, 1)
  })

  it("sin datos explica qué información falta y no inventa rutas", () => {
    render(<RouteMap data={NO_MAP_DATA} />)

    expect(screen.getByText("Aún no hay rutas ni posiciones para dibujar")).toBeInTheDocument()
    expect(screen.getByLabelText("Leyenda del mapa")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Mapa de Buenaventura" })).toBeInTheDocument()
  })

  it("con datos oculta el estado vacío", () => {
    const data: MapData = {
      ...NO_MAP_DATA,
      positions: [{ id: "p1", microrouteId: "m1", lat: 3.88, lng: -77.03, createdAt: "2026-11-14T10:00:00Z" }],
    }
    render(<RouteMap data={data} />)

    expect(screen.queryByText("Aún no hay rutas ni posiciones para dibujar")).not.toBeInTheDocument()
  })
})

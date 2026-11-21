import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import LandingMap from "./LandingMap"
import { loadStreets } from "./loadStreets"
import { makeStreetSample } from "./test/streetSample"

vi.mock("./loadStreets", () => ({ loadStreets: vi.fn() }))
const load = vi.mocked(loadStreets)

beforeAll(() => {
  // jsdom no calcula tamaños: Leaflet necesita un contenedor con dimensiones.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 900 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 480 })
})
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

describe("LandingMap", () => {
  it("muestra el estado de carga mientras llegan las calles", () => {
    load.mockReturnValue(new Promise(() => {}))
    render(<LandingMap />)

    expect(screen.getByRole("status")).toHaveTextContent(/Cargando las calles de Buenaventura/)
    expect(screen.getByText("Simulación ilustrativa")).toBeInTheDocument()
  })

  it("dibuja tres rutas con leyenda y las rotula como demostración", async () => {
    load.mockResolvedValue(makeStreetSample())
    const { container } = render(<LandingMap />)

    const legend = await screen.findByRole("list", { name: "Leyenda del mapa" })
    await waitFor(() => expect(container.querySelectorAll("path.lm-route").length).toBe(6)) // 3 rutas × (borde + trazo)
    for (const name of ["Ruta A", "Ruta B", "Ruta C"]) expect(legend).toHaveTextContent(name)
    expect(screen.getByText(/No representan la operación real/)).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("pone un camión por ruta", async () => {
    load.mockResolvedValue(makeStreetSample())
    const { container } = render(<LandingMap />)

    await waitFor(() => expect(container.querySelectorAll(".lm-truck").length).toBe(3))
  })

  it("con movimiento reducido los camiones quedan quietos en su ruta", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {} }))
    load.mockResolvedValue(makeStreetSample())
    const { container } = render(<LandingMap />)

    await waitFor(() => expect(container.querySelectorAll(".lm-truck").length).toBe(3))
    const before = container.querySelector(".lm-marker")?.getAttribute("style")
    await new Promise((r) => setTimeout(r, 120))
    expect(container.querySelector(".lm-marker")?.getAttribute("style")).toBe(before)
  })

  it("explica el error y permite reintentar", async () => {
    const user = userEvent.setup()
    load.mockRejectedValueOnce(new Error("sin red"))
    load.mockResolvedValueOnce(makeStreetSample())
    render(<LandingMap />)

    expect(await screen.findByRole("alert")).toHaveTextContent(/No se pudieron cargar las calles/)

    await user.click(screen.getByRole("button", { name: "Reintentar" }))

    expect(await screen.findByRole("list", { name: "Leyenda del mapa" })).toHaveTextContent("Ruta A")
    expect(load).toHaveBeenCalledTimes(2)
  })
})

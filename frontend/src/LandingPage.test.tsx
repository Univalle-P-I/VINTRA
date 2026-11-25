import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import LandingPage from "./LandingPage"

vi.mock("./LandingMap", () => ({ default: () => <div>Mapa de prueba</div> }))

describe("LandingPage", () => {
  it("presenta el mensaje principal y una sola acción de acceso clara", () => {
    render(<LandingPage onLogin={vi.fn()} />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Buenaventura/)
    expect(screen.getByRole("link", { name: "Ver cómo funciona" })).toHaveAttribute("href", "#funciona")
  })

  it("no muestra mapas ni cifras de demostración presentados como reales", () => {
    render(<LandingPage onLogin={vi.fn()} />)

    expect(screen.queryByText(/vista previa/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/94\.2/)).not.toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("tiene la animación de la portada y el mapa de Buenaventura como cosas separadas", async () => {
    const { container } = render(<LandingPage onLogin={vi.fn()} />)

    expect(container.querySelector(".home-hero .hero-routes")).not.toBeNull()
    expect(screen.getByRole("heading", { name: /Las rutas, sobre Buenaventura/ })).toBeInTheDocument()
    expect(await screen.findByText("Mapa de prueba")).toBeInTheDocument()
    expect(container.querySelector("#mapa .hero-routes")).toBeNull()
  })

  it("no ofrece controles para mover los camiones a mano", () => {
    render(<LandingPage onLogin={vi.fn()} />)

    expect(screen.queryByText(/Enviar camión/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Haz clic en un punto/)).not.toBeInTheDocument()
  })

  it("explica el proceso en tres pasos", () => {
    render(<LandingPage onLogin={vi.fn()} />)

    const steps = screen.getAllByRole("listitem").filter((li) => li.closest("ol"))
    expect(steps).toHaveLength(3)
  })

  it("lleva al inicio de sesión desde el encabezado, la portada y el cierre", async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    render(<LandingPage onLogin={onLogin} />)

    for (const button of screen.getAllByRole("button", { name: "Iniciar sesión" })) {
      await user.click(button)
    }
    expect(onLogin).toHaveBeenCalledTimes(3)
  })

  it("cambia el menú mostrado al elegir otro perfil", async () => {
    const user = userEvent.setup()
    render(<LandingPage onLogin={vi.fn()} />)

    expect(screen.getByRole("tab", { name: "Administrador" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Gestión de personal")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Conductor" }))

    const panel = within(screen.getByRole("tabpanel"))
    expect(panel.getByText("Mi recorrido")).toBeInTheDocument()
    expect(panel.queryByText("Gestión de personal")).not.toBeInTheDocument()
  })

  it("indica que el jefe de operaciones solo consulta flota, personal y rutas", async () => {
    const user = userEvent.setup()
    render(<LandingPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole("tab", { name: "Jefe de operaciones" }))

    expect(within(screen.getByRole("tabpanel")).getAllByText("Solo consulta")).toHaveLength(3)
  })

  it("permite cambiar de perfil con las flechas del teclado", async () => {
    const user = userEvent.setup()
    render(<LandingPage onLogin={vi.fn()} />)

    screen.getByRole("tab", { name: "Administrador" }).focus()
    await user.keyboard("{ArrowRight}")

    expect(screen.getByRole("tab", { name: "Jefe de operaciones" })).toHaveAttribute("aria-selected", "true")
  })

  it("deja Ciudadano como próximamente, sin poder seleccionarlo", () => {
    render(<LandingPage onLogin={vi.fn()} />)

    expect(screen.queryByRole("tab", { name: /Ciudadano/ })).not.toBeInTheDocument()
    expect(screen.getByText("Próximamente")).toBeInTheDocument()
  })
})

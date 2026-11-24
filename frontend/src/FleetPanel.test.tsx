import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import FleetPanel from "./FleetPanel"
import { DataProvider } from "./store"

const renderFleet = () => render(<DataProvider><FleetPanel /></DataProvider>)

async function registerPlate(user: ReturnType<typeof userEvent.setup>, plate: string) {
  await user.click(screen.getAllByRole("button", { name: /registrar (el primer )?vehículo/i })[0])
  await user.type(screen.getByLabelText("Placa"), plate)
  await user.click(screen.getByRole("button", { name: "Guardar vehículo" }))
}

describe("FleetPanel plate normalization", () => {
  it.each([
    ["abc 123", "ABC123"],
    ["xy 9-z", "XY9-Z"],
    ["12 ab 34", "12AB34"],
  ])("normalizes %s to %s and rejects its duplicate", async (inputPlate, normalizedPlate) => {
    const user = userEvent.setup()
    renderFleet()

    await registerPlate(user, inputPlate)
    expect(screen.getByText(normalizedPlate)).toBeTruthy()
    expect(screen.getByRole("status").textContent).toContain(normalizedPlate)

    await registerPlate(user, inputPlate.toUpperCase().split("").join(" "))

    expect(screen.getByText("La placa ya está registrada.")).toBeTruthy()
    expect(screen.getAllByText(normalizedPlate)).toHaveLength(1)
  })

  it("exige la placa y valida la capacidad antes de guardar", async () => {
    const user = userEvent.setup()
    renderFleet()

    await user.click(screen.getAllByRole("button", { name: /registrar/i })[0])
    await user.type(screen.getByLabelText("Capacidad (kg)"), "-5")
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }))

    expect(screen.getByText("Escribe la placa del vehículo.")).toBeTruthy()
    expect(screen.getByText(/capacidad en kg mayor que cero/i)).toBeTruthy()
  })

  it("separa el estado operativo del registro activo", async () => {
    const user = userEvent.setup()
    renderFleet()

    await user.click(screen.getAllByRole("button", { name: /registrar/i })[0])
    const dialog = within(screen.getByRole("dialog", { name: "Registrar vehículo" }))
    expect(dialog.getByLabelText("Estado operativo")).toBeTruthy()
    expect(dialog.getByLabelText("Registro activo")).toBeTruthy()
  })

  it("oculta el registro cuando el perfil solo consulta", () => {
    render(<DataProvider><FleetPanel canManage={false} /></DataProvider>)
    expect(screen.queryByRole("button", { name: /registrar/i })).toBeNull()
  })
})

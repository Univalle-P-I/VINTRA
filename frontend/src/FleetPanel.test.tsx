import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import FleetPanel from "./FleetPanel"

describe("FleetPanel plate normalization", () => {
  it.each([
    ["abc 123", "ABC123"],
    ["xy 9-z", "XY9-Z"],
    ["12 ab 34", "12AB34"],
  ])("normalizes %s to %s and rejects its duplicate", async (inputPlate, normalizedPlate) => {
    const user = userEvent.setup()
    render(<FleetPanel />)

    await user.type(screen.getByLabelText("Placa"), inputPlate)
    await user.type(screen.getByLabelText("Marca / modelo"), "Camión")
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }))

    expect(screen.getByText(normalizedPlate)).toBeTruthy()

    await user.type(screen.getByLabelText("Placa"), inputPlate.toUpperCase().split("").join(" "))
    await user.type(screen.getByLabelText("Marca / modelo"), "Otro camión")
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }))

    expect(screen.getByRole("status").textContent).toBe("La placa ya está registrada.")
    expect(screen.getAllByText(normalizedPlate)).toHaveLength(1)
  })
})

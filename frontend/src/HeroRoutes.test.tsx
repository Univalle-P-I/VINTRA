import { act, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import HeroRoutes from "./HeroRoutes"

afterEach(() => vi.unstubAllGlobals())

describe("HeroRoutes", () => {
  it("es decorativa: oculta a lectores de pantalla y sin controles ni clics", () => {
    const { container } = render(<HeroRoutes />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelectorAll("button, a, [tabindex]").length).toBe(0)
    expect(container.querySelectorAll(".hero-layer").length).toBe(3)
  })

  it("los camiones salen solos hacia un punto y lo marcan como destino", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const { container } = render(<HeroRoutes />)

    const frame = frames.shift()
    expect(frame).toBeDefined()
    act(() => frame?.(performance.now() + 2000))
    await waitFor(() => expect(container.querySelector(".sim-route")).not.toBeNull())
    expect(container.querySelector(".sim-node.is-target")).not.toBeNull()
  })

  it("con movimiento reducido los camiones no se mueven", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {} }))
    const requestFrame = vi.spyOn(window, "requestAnimationFrame")
    const { container } = render(<HeroRoutes />)

    expect(requestFrame).not.toHaveBeenCalled()
    expect(container.querySelector(".sim-route")).toBeNull()
  })
})

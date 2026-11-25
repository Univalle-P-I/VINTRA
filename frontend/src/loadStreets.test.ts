import { beforeEach, describe, expect, it, vi } from "vitest"
import { loadStreets } from "./loadStreets"
import { makeStreetSample } from "./test/streetSample"

const sample = makeStreetSample()
const json = (body: unknown, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) }) as Promise<Response>

beforeEach(() => localStorage.clear())

describe("loadStreets", () => {
  it("usa el archivo estático si existe y no consulta Overpass", async () => {
    const fetcher = vi.fn((url: RequestInfo | URL) => (String(url).startsWith("/data/") ? json(sample) : json({}, false, 500)))
    const data = await loadStreets(fetcher as unknown as typeof fetch)
    expect(data).toEqual(sample)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("si el archivo estático no es válido, consulta Overpass con la zona de Buenaventura y guarda en caché", async () => {
    const fetcher = vi.fn((url: RequestInfo | URL) => (String(url).startsWith("/data/") ? json("<html>") : json(sample)))
    const data = await loadStreets(fetcher as unknown as typeof fetch)

    expect(data).toEqual(sample)
    const overpassCall = String(fetcher.mock.calls[1][0])
    expect(overpassCall).toContain("overpass-api.de")
    expect(decodeURIComponent(overpassCall)).toContain("highway")

    const second = vi.fn()
    await loadStreets(second as unknown as typeof fetch)
    expect(second).not.toHaveBeenCalled()
  })

  it("falla con un error claro si Overpass no responde bien", async () => {
    const fetcher = vi.fn((url: RequestInfo | URL) => (String(url).startsWith("/data/") ? json(null, false, 404) : json({}, false, 429)))
    await expect(loadStreets(fetcher as unknown as typeof fetch)).rejects.toThrow(/429/)
  })

  it("rechaza respuestas sin calles", async () => {
    const fetcher = vi.fn((url: RequestInfo | URL) => (String(url).startsWith("/data/") ? json(null, false, 404) : json({ elements: [] })))
    await expect(loadStreets(fetcher as unknown as typeof fetch)).rejects.toThrow(/sin calles/i)
  })

  it("ignora una caché vencida", async () => {
    localStorage.setItem("vintra.streets.v1", JSON.stringify({ at: Date.now() - 8 * 24 * 3600 * 1000, data: sample }))
    const fetcher = vi.fn((url: RequestInfo | URL) => (String(url).startsWith("/data/") ? json(sample) : json({}, false, 500)))
    await loadStreets(fetcher as unknown as typeof fetch)
    expect(fetcher).toHaveBeenCalled()
  })
})

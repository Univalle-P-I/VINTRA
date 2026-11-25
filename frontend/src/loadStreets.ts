import { overpassQuery } from "./streets"
import type { OverpassResponse } from "./streets"

const CACHE_KEY = "vintra.streets.v1"
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const STATIC_URL = `${import.meta.env.BASE_URL}data/buenaventura-streets.json`
const OVERPASS_URL = "https://overpass-api.de/api/interpreter"

const isStreets = (x: unknown): x is OverpassResponse =>
  typeof x === "object" && x !== null && Array.isArray((x as OverpassResponse).elements) &&
  (x as OverpassResponse).elements.some((w) => Array.isArray(w.nodes) && Array.isArray(w.geometry))

function readCache(): OverpassResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw)
    return Date.now() - at < CACHE_TTL_MS && isStreets(data) ? data : null
  } catch {
    return null
  }
}

function writeCache(data: OverpassResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* sin espacio o almacenamiento bloqueado: se vuelve a pedir la próxima vez */
  }
}

/**
 * Orden: caché local → archivo estático opcional (`public/data/buenaventura-streets.json`,
 * con la misma forma que la respuesta de Overpass) → consulta a Overpass.
 */
export async function loadStreets(fetcher: typeof fetch = (...a) => fetch(...a)): Promise<OverpassResponse> {
  const cached = readCache()
  if (cached) return cached

  try {
    const res = await fetcher(STATIC_URL)
    if (res.ok) {
      const data = await res.json()
      if (isStreets(data)) return data
    }
  } catch {
    /* no hay archivo estático: se usa Overpass */
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  try {
    const res = await fetcher(`${OVERPASS_URL}?data=${encodeURIComponent(overpassQuery())}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Overpass respondió ${res.status}`)
    const data = await res.json()
    if (!isStreets(data)) throw new Error("Respuesta sin calles")
    writeCache(data)
    return data
  } finally {
    clearTimeout(timer)
  }
}

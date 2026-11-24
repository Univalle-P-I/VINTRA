import { createContext, useContext } from "react"
import type { Assignment, Macroroute, Microroute, Person, Vehicle } from "./domain"

/** Cuadrilla: tabla `crew` + `crew_member` (ids de personas). */
export type Crew = { id: string; name: string; memberIds: string[] }
/** Horario: `schedule` + `microroute_schedule`, aplanado para la interfaz. Días ISO 1–7. */
export type ScheduleEntry = { id: string; name: string; start: string; end: string; microrouteId: string; days: number[]; active: boolean }

export type Store = {
  vehicles: Vehicle[]; people: Person[]; crews: Crew[]
  macroroutes: Macroroute[]; microroutes: Microroute[]
  schedules: ScheduleEntry[]; assignments: Assignment[]
  add: {
    vehicle: (v: Omit<Vehicle, "id">) => void
    person: (p: Omit<Person, "id">) => void
    crew: (c: Omit<Crew, "id">) => void
    macroroute: (name: string) => void
    microroute: (m: Omit<Microroute, "id" | "isActive">) => void
    schedule: (s: Omit<ScheduleEntry, "id" | "active">) => void
    assignment: (a: Omit<Assignment, "id">) => void
  }
}

export const Ctx = createContext<Store | null>(null)

export function useData(): Store {
  const store = useContext(Ctx)
  if (!store) throw new Error("useData debe usarse dentro de <DataProvider>")
  return store
}

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Assignment, Macroroute, Microroute, Person, Vehicle } from "./domain"
import { Ctx } from "./store-context"
import type { Crew, ScheduleEntry, Store } from "./store-context"

const id = () => crypto.randomUUID()

/**
 * Estado local de la sesión. El backend aún no expone endpoints de negocio,
 * por eso los registros no se persisten. Sustituir por las consultas reales.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [macroroutes, setMacro] = useState<Macroroute[]>([])
  const [microroutes, setMicro] = useState<Microroute[]>([])
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const value = useMemo<Store>(() => ({
    vehicles, people, crews, macroroutes, microroutes, schedules, assignments,
    add: {
      vehicle: (v) => setVehicles((c) => [...c, { ...v, id: id() }]),
      person: (p) => setPeople((c) => [...c, { ...p, id: id() }]),
      crew: (x) => setCrews((c) => [...c, { ...x, id: id() }]),
      macroroute: (name) => setMacro((c) => [...c, { id: id(), name, isActive: true }]),
      microroute: (m) => setMicro((c) => [...c, { ...m, id: id(), isActive: true }]),
      schedule: (s) => setSchedules((c) => [...c, { ...s, id: id(), active: true }]),
      assignment: (a) => setAssignments((c) => [...c, { ...a, id: id() }]),
    },
  }), [vehicles, people, crews, macroroutes, microroutes, schedules, assignments])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

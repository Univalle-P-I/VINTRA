import type { Assignment } from "./domain"

type AssignmentWindow = Pick<Assignment, "startAt" | "endAt">
const overlaps = (a: AssignmentWindow, b: AssignmentWindow) => a.startAt < b.endAt && b.startAt < a.endAt

/** Valida una nueva asignación contra las existentes, sin requerir un id temporal. */
export function assignmentConflict(candidate: Omit<Assignment, "id">, existing: Assignment[]) {
  let conflict: string | undefined
  for (const assignment of existing) {
    if (!overlaps(candidate, assignment)) continue
    if (candidate.vehicle === assignment.vehicle) conflict = "Vehículo repetido"
    if (candidate.crew === assignment.crew) conflict = "Cuadrilla repetida"
  }
  return conflict
}

/** Una cuadrilla o un vehículo no pueden estar en dos asignaciones a la vez. */
export function findConflicts(list: Assignment[]) {
  const out = new Map<string, string>()
  list.forEach((a, i) => list.slice(i + 1).forEach((b) => {
    if (!overlaps(a, b)) return
    if (a.vehicle === b.vehicle) { out.set(a.id, "Vehículo repetido"); out.set(b.id, "Vehículo repetido") }
    if (a.crew === b.crew) { out.set(a.id, "Cuadrilla repetida"); out.set(b.id, "Cuadrilla repetida") }
  }))
  return out
}

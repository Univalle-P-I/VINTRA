import { describe, expect, it } from "vitest"
import { assignmentConflict, findConflicts } from "./conflicts"
import type { Assignment } from "./domain"

const a = (id: string, crew: string, vehicle: string, startAt: string, endAt: string): Assignment =>
  ({ id, crew, microroute: "M1", vehicle, startAt, endAt })

describe("findConflicts", () => {
  it("detecta un vehículo asignado a dos recorridos que se solapan", () => {
    const result = findConflicts([
      a("1", "A", "ABC123", "2026-11-14T06:00", "2026-11-14T10:00"),
      a("2", "B", "ABC123", "2026-11-14T09:00", "2026-11-14T12:00"),
    ])
    expect(result.get("1")).toBe("Vehículo repetido")
    expect(result.get("2")).toBe("Vehículo repetido")
  })

  it("detecta una cuadrilla repetida en el mismo horario", () => {
    const result = findConflicts([
      a("1", "A", "V1", "2026-11-14T06:00", "2026-11-14T10:00"),
      a("2", "A", "V2", "2026-11-14T08:00", "2026-11-14T09:00"),
    ])
    expect(result.get("1")).toBe("Cuadrilla repetida")
  })

  it("no marca recorridos consecutivos ni de recursos distintos", () => {
    const result = findConflicts([
      a("1", "A", "V1", "2026-11-14T06:00", "2026-11-14T10:00"),
      a("2", "A", "V1", "2026-11-14T10:00", "2026-11-14T12:00"),
      a("3", "B", "V2", "2026-11-14T06:00", "2026-11-14T10:00"),
    ])
    expect(result.size).toBe(0)
  })
})

describe("assignmentConflict", () => {
  it("rechaza una nueva asignación si reutiliza vehículo o cuadrilla en el intervalo", () => {
    const existing = [a("1", "Cuadrilla A", "ABC123", "2026-11-14T06:00", "2026-11-14T10:00")]
    expect(assignmentConflict({ crew: "Cuadrilla B", vehicle: "ABC123", microroute: "M2", startAt: "2026-11-14T09:00", endAt: "2026-11-14T12:00" }, existing)).toBe("Vehículo repetido")
    expect(assignmentConflict({ crew: "Cuadrilla A", vehicle: "XYZ987", microroute: "M2", startAt: "2026-11-14T09:00", endAt: "2026-11-14T12:00" }, existing)).toBe("Cuadrilla repetida")
  })

  it("permite intervalos consecutivos", () => {
    const existing = [a("1", "Cuadrilla A", "ABC123", "2026-11-14T06:00", "2026-11-14T10:00")]
    expect(assignmentConflict({ crew: "Cuadrilla A", vehicle: "ABC123", microroute: "M2", startAt: "2026-11-14T10:00", endAt: "2026-11-14T12:00" }, existing)).toBeUndefined()
  })
})

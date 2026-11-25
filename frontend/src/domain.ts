/**
 * Tipos del dominio alineados con el modelo entidad-relación de VINTRA.
 * Los catálogos (vehicle_status, vehicle_type, assignment_status…) viven en la
 * base de datos; mientras el backend no los publique se usan los valores que
 * el equipo ya tenía definidos en la interfaz. Reemplazar por la consulta real.
 */

export type Role = "admin" | "ops" | "driver" | "citizen"

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  ops: "Jefe de operaciones",
  driver: "Conductor",
  citizen: "Ciudadano",
}

// Provisional: equivale a vehicle_status.name
export const VEHICLE_STATUSES = ["Disponible", "En operación", "Mantenimiento", "Inhabilitado"] as const
// Provisional: equivale a vehicle_type.name
export const VEHICLE_TYPES = ["Compactador", "Volqueta", "Camión", "Otro"] as const

export type VehicleStatusName = (typeof VEHICLE_STATUSES)[number]

/** Tabla `vehicle`. `status` es el estado operativo; `isActive` es un indicador aparte. */
export type Vehicle = {
  id: string
  plate: string
  type: string
  status: VehicleStatusName
  capacityKg: number | null
  capacityYd3: number | null
  isActive: boolean
}

/** Tablas `macroroute` / `microroute` (geom en GeoJSON, EPSG:4326). */
export type Macroroute = { id: string; name: string; isActive: boolean }
export type Microroute = { id: string; macrorouteId: string; name: string; isActive: boolean }

/** Tabla `assignment`: cuadrilla + microruta + vehículo. */
export type Assignment = {
  id: string
  crew: string
  microroute: string
  vehicle: string
  startAt: string
  endAt: string
}

/** Tablas `profile` + `user_role` + `user_status` (resumen para el listado). */
export type Person = {
  id: string
  name: string
  document: string
  phone: string
  role: "Administrador" | "Jefe de operaciones" | "Conductor"
  active: boolean
}

export const normalizePlate = (plate: string) => plate.replace(/\s/g, "").toUpperCase()

/** Fecha local en formato YYYY-MM-DD, consistente con los campos datetime-local. */
export function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

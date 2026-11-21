import type { Role } from "./domain"

export type ScreenId = "overview" | "fleet" | "people" | "routes" | "operations" | "map" | "myroute" | "schedules"

export type NavItem = { id: ScreenId; label: string; icon: string; roles: Role[] }

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Resumen", icon: "home", roles: ["admin", "ops"] },
  { id: "operations", label: "Gestión de operación", icon: "clipboard", roles: ["admin", "ops"] },
  { id: "fleet", label: "Gestión de flota", icon: "truck", roles: ["admin", "ops"] },
  { id: "people", label: "Gestión de personal", icon: "users", roles: ["admin", "ops"] },
  { id: "routes", label: "Gestión de rutas", icon: "route", roles: ["admin", "ops"] },
  { id: "map", label: "Mapa", icon: "map", roles: ["admin", "ops"] },
  { id: "myroute", label: "Mi recorrido", icon: "route", roles: ["driver"] },
  { id: "schedules", label: "Rutas y horarios", icon: "calendar", roles: ["citizen"] },
]

export const navFor = (role: Role) => NAV_ITEMS.filter((i) => i.roles.includes(role))
export const homeFor = (role: Role): ScreenId => navFor(role)[0].id

/** Quién puede crear o editar en cada módulo (el resto solo consulta). */
export const CAN_MANAGE: Record<"fleet" | "people" | "routes" | "operations", Role[]> = {
  fleet: ["admin"],
  people: ["admin"],
  routes: ["admin"],
  operations: ["admin", "ops"],
}

# Módulo de Rutas

Andamiaje del módulo de Rutas para integrarlo con los recursos de planificación
del backend. **No implementa operaciones funcionales** de creación, consulta ni
asociación geográfica: eso corresponde a [#79 (VIN-027)](https://github.com/Univalle-P-I/VINTRA/issues/79).

> **Modelo de datos provisional.** Las entidades siguen el diccionario de
> `docs/DATABASE_DESIGN.md` y pueden cambiar hasta que se apruebe la
> [PR #115](https://github.com/Univalle-P-I/VINTRA/pull/115). Las columnas
> geométricas (`geom`, PostGIS) no están mapeadas.

## Estructura

```text
rutas/
├── rutas.module.ts
├── rutas.module.spec.ts
├── macrorutas/   controller, service, entities/macroruta, dto/
├── microrutas/   controller, service, entities/microruta + microruta-barrio, dto/
└── barrios/      controller, service, entities/barrio, dto/

flowchart TD
  App[AppModule] --> Rutas[RutasModule]
  Rutas --> TO["TypeOrmModule.forFeature"]
  Rutas --> MC[MacrorutasController] --> MS[MacrorutasService] --> Ma[(Macroruta)]
  Rutas --> MiC[MicrorutasController] --> MiS[MicrorutasService]
  MiS --> Mi[(Microruta)]
  MiS --> MB[(MicrorutaBarrio)]
  Rutas --> BC[BarriosController] --> BS[BarriosService] --> Ba[(Barrio)]
  Mi -->|N a 1| Ma
  MB -->|N a 1| Mi
  MB -->|N a 1| Ba

  Componente	Depende de
MacrorutasController	MacrorutasService
MicrorutasController	MicrorutasService
BarriosController	BarriosService
MacrorutasService	Repositorio de Macroruta
MicrorutasService	Repositorios de Microruta y MicrorutaBarrio
BarriosService	Repositorio de Barrio
Reglas del diseño:

Cada servicio inyecta solo sus propios repositorios; no hay dependencias entre servicios, así se evitan ciclos.
Relaciones: Macroruta 1 — N Microruta; Microruta N — M Barrio mediante MicrorutaBarrio (con order_visit).
RutasModule exporta los tres servicios; no exporta TypeOrmModule.
AppModule carga las entidades con autoLoadEntities: true y synchronize: false: este módulo no crea tablas.
Correspondencia con el diccionario de BD
Entidad	Tabla
Macroruta	macroroute
Microruta	microroute
Barrio	btura_neighborhood
MicrorutaBarrio	microroute_neighborhood

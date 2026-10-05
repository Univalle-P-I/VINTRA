# UI/UX

Guía para documentar la experiencia de quienes consultan o administran el servicio.

## Debe publicarse aquí

- objetivos y necesidades de cada perfil;
- flujos de navegación y prototipos;
- decisiones de diseño visual y componentes reutilizables;
- estados vacíos, carga, error y confirmación;
- criterios de accesibilidad y diseño responsive;
- recursos entregados al frontend y su versión vigente.

## Estado

- Estado: `Borrador`
- Responsable: Célula UI/UX
- Pendiente: publicar la landing page, flujos y criterios visuales.

---

## 1. Objetivo

Definir la estructura de navegación, las pantallas, los flujos y los criterios de experiencia de usuario necesarios para que VINTRA permita gestionar la flota, el personal, las rutas y la operación del servicio de recolección de residuos.

El diseño contempla los diferentes perfiles de usuario y sus responsabilidades dentro de la plataforma:

- Administrador
- Conductor
- Ciudadano

---

## 2. Perfiles y roles

### 2.1 Administrador

Responsable de gestionar y supervisar la operación de la plataforma.

#### Permisos del administrador

- Gestionar vehículos.
- Gestionar conductores.
- Crear y modificar macrorutas.
- Crear y modificar microrutas.
- Asignar vehículos.
- Asignar conductores.
- Consultar recorridos.
- Consultar incidencias.
- Supervisar el estado de las rutas.
- Consultar la ubicación GPS de los vehículos.

---

### 2.2 Conductor

Responsable de ejecutar el recorrido que le fue asignado.

#### Permisos del conductor

- Consultar recorrido asignado.
- Iniciar recorrido.
- Enviar o registrar ubicación GPS.
- Consultar información de la ruta.
- Registrar incidencias durante el recorrido.
- Marcar novedades de recolección.
- Finalizar recorrido.

---

### 2.3 Ciudadano

Responsable de consultar información relacionada con el servicio y reportar problemas.

#### Permisos del ciudadano

- Consultar horarios.
- Consultar rutas.
- Consultar el estado de recolección.
- Reportar residuos no recogidos.
- Consultar el estado de sus reportes.

---

## 3. Pantallas identificadas

### 3.1 Gestión de flota

---

#### 3.1.1 Listado principal / Dashboard de flota

- Listado de vehículos registrados.
- Placa.
- Marca y modelo.
- Capacidad de carga.
- Tipo de combustible.
- Conductor asignado.
- Estado del vehículo.
- Búsqueda y filtros por estado.

---

#### 3.1.2 Registro / edición de vehículo

- Placa.
- Marca y modelo.
- Año.
- Capacidad de carga.
- Tipo de combustible.
- Fecha de última revisión técnica.

---

#### 3.1.3 Hoja de vida / detalle del vehículo

- Información técnica del vehículo.
- Estado actual.
- Conductor asignado.
- Historial de rutas recorridas.
- Historial de mantenimientos.
- Historial de fallas.

---

#### 3.1.4 Registro de mantenimiento / novedad

- Tipo de novedad.
- Avería mecánica.
- Mantenimiento programado.
- Accidente.
- Fecha estimada de retorno.
- Observaciones.

---

### 3.2 Gestión del personal

#### 3.2.1 Listado de conductores

##### Elementos del listado de conductores

##### Acciones del listado de conductores

---

#### 3.2.2 Detalle / perfil del conductor

##### Información del perfil del conductor

##### Acción del perfil del conductor

---

#### 3.2.3 Crear / editar conductor

##### Datos personales del conductor

##### Datos de licencia del conductor

##### Acceso del conductor

##### Acciones de gestión del conductor

##### Validaciones del conductor

---

#### 3.2.4 Activar / desactivar conductor

##### Elementos de activación del conductor

---

#### 3.2.5 Disponibilidad y turnos

##### Elementos de disponibilidad y turnos

##### Estados de disponibilidad y turnos

##### Acciones de disponibilidad y turnos

---

#### 3.2.6 Gestión de usuarios y roles

##### Información de usuarios y roles

##### Roles de usuario

##### Acciones de usuarios y roles

---

---

### 3.3 Gestión de rutas

#### 3.3.1 Listado de rutas

- Visualizar macrorutas y microrutas.
- Consultar el estado de cada ruta.
- Consultar vehículo y conductor asignados.

---

#### 3.3.2 Crear macroruta

- Definir zona o sector de cobertura.
- Establecer recorrido general.
- Registrar información de la macroruta.

---

#### 3.3.3 Crear microruta

- Asociar la microruta a una macroruta.
- Definir sectores o puntos de recorrido.
- Establecer recorrido específico.

---

#### 3.3.4 Detalle de ruta

- Visualizar información de la ruta.
- Consultar recorrido.
- Consultar horario.
- Consultar estado.
- Visualizar vehículo y conductor asignados.

---

#### 3.3.5 Editar / modificar ruta

- Modificar información de la ruta.
- Actualizar recorrido.
- Modificar sectores o puntos de cobertura.
- Actualizar horario.

---

#### 3.3.6 Asignación de vehículo y conductor

- Seleccionar vehículo disponible.
- Seleccionar conductor disponible.
- Asociarlos a una ruta.
- Confirmar o modificar la asignación.

---

#### 3.3.7 Estado de la ruta

- Pendiente.
- Asignada.
- En recorrido.
- Finalizada.

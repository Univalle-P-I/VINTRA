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

- Buscador y filtros por estado y disponibilidad.
- Nombre.
- Documento.
- Teléfono.
- Estado (activo/inactivo).
- Vencimiento de licencia.
- Nuevo conductor.
- Ver conductor.
- Editar conductor.
- Desactivar conductor.

---

#### 3.2.2 Detalle / perfil del conductor

- Foto.
- Datos personales.
- Datos de contacto.
- Licencia.
- Categoría de licencia.
- Fecha de vencimiento de licencia.
- Estado actual.
- Vehículo asignado.
- Ruta asignada.
- Historial de recorridos.
- Editar conductor.

---

#### 3.2.3 Crear / editar conductor

- Nombre.
- Documento.
- Teléfono.
- Correo.
- Foto.
- Número de licencia.
- Categoría de licencia.
- Fecha de vencimiento.
- Usuario.
- Contraseña.
- Rol Conductor.
- Guardar.
- Cancelar.
- Validación de campos obligatorios.

---

#### 3.2.4 Activar / desactivar conductor

- Nombre del conductor.
- Confirmación de activación o desactivación.
- Motivo de la desactivación.
- Aviso de asignación activa o pendiente.

---

#### 3.2.5 Disponibilidad y turnos

- Calendario o tabla semanal.
- Turnos asignados.
- Disponible.
- En ruta.
- Descanso.
- Incapacidad.
- Asignar turno.
- Editar turno.
- Conflictos de horarios.

---

#### 3.2.6 Gestión de usuarios y roles

- Lista de usuarios.
- Administrador.
- Conductor.
- Ciudadano.
- Estado del usuario.
- Crear usuario.
- Editar usuario.
- Bloquear usuario.
- Restablecer contraseña.
- Asignación de roles.
- Permisos asociados a cada rol.

---

### 3.3 Gestión de rutas

#### 3.3.1 Listado de rutas

##### Información del listado de rutas

##### Acciones del listado de rutas

---

#### 3.3.2 Crear macroruta

##### Información de creación de macroruta

##### Acción de creación de macroruta

---

#### 3.3.3 Crear microruta

##### Información de creación de microruta

##### Acción de creación de microruta

---

#### 3.3.4 Detalle de ruta

##### Información del detalle de ruta

---

#### 3.3.5 Editar / modificar ruta

##### Información modificable de ruta

---

#### 3.3.6 Asignación de vehículo y conductor

##### Elementos de asignación de vehículo y conductor

##### Acciones de asignación de vehículo y conductor

---

#### 3.3.7 Estado de la ruta

---

---

### 3.4 Gestión de operación

#### 3.4.1 Dashboard de operación

- Vehículos en ruta.
- Vehículos disponibles.
- Vehículos en taller.
- Conductores activos.
- Recorridos programados.
- Recorridos en curso.
- Recorridos finalizados.
- Alertas de novedades.
- Acceso a asignaciones.
- Acceso al monitoreo.

---

#### 3.4.2 Asignación de vehículo y conductor

- Ruta.
- Fecha.
- Horario.
- Vehículos disponibles.
- Conductores disponibles.
- Validación de licencia vencida.
- Validación de asignaciones existentes.
- Confirmación de asignación.

---

#### 3.4.3 Monitoreo en vivo

- Mapa con ubicación de vehículos.
- Recorridos activos.
- Estado de los recorridos.
- Conductor asignado.
- Ruta asignada.
- Hora estimada de llegada.

---

#### 3.4.4 Historial de recorridos y novedades

- Filtro por fecha.
- Filtro por ruta.
- Filtro por vehículo.
- Filtro por conductor.
- Hora de inicio.
- Hora de finalización.
- Estado del recorrido.
- Novedades registradas.
- Detalle del recorrido.
- Exportación del historial.

---

#### 3.4.5 Asignación del día

- Ruta asignada.
- Vehículo asignado.
- Horario.
- Paradas del recorrido.
- Información del vehículo.
- Inicio del recorrido.

---

#### 3.4.6 Recorrido en curso

- Mapa de la ruta.
- Siguiente parada.
- Hora estimada de llegada.
- Registro de novedades.
- Texto de la novedad.
- Foto de la novedad.
- Finalización del recorrido.

---

#### 3.4.7 Historial de recorridos del conductor

- Recorridos anteriores.
- Fecha del recorrido.
- Ruta.
- Estado del recorrido.
- Novedades registradas.
- Detalle del recorrido.

---

#### 3.4.8 Mapa de vehículos en vivo

- Vehículos en movimiento.
- Filtro por ruta.
- Ruta del vehículo.
- Hora estimada de llegada.
- Paradas cercanas.

---

#### 3.4.9 Consulta de rutas y horarios

- Listado de rutas.
- Buscador de rutas.
- Recorrido.
- Paradas.
- Horarios.
- Rutas favoritas.

---

#### 3.4.10 Notificaciones

- Lista de notificaciones.
- Retrasos.
- Cambios de ruta.
- Novedades del servicio.
- Estado de lectura.
- Configuración de notificaciones.

---

#### 3.4.11 Reportes de incidencia o problemas

- Tipo de problema.
- Ruta o parada.
- Descripción.
- Foto.
- Número de seguimiento.
- Estado del reporte.
- Recibido.
- En revisión.
- Resuelto.

---

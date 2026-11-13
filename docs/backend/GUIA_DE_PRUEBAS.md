# GUÍA DE PRUEBAS DEL BACKEND – VINTRA

**Proyecto:** VINTRA – Sistema de gestión de rutas de recolección de residuos
**Tecnologías:** NestJS, TypeScript, Jest, TypeORM y PostgreSQL.
**Propósito:** Establecer los lineamientos para ejecutar, desarrollar y verificar las pruebas del backend de VINTRA.

---

## 1. Introducción

Esta guía establece el procedimiento que deben seguir los integrantes del equipo de desarrollo para realizar pruebas sobre los módulos del backend de VINTRA.

Su finalidad es verificar que los servicios, controladores y validaciones implementados funcionen de acuerdo con los requisitos funcionales del proyecto, detectar errores durante el desarrollo y reducir problemas al integrar los módulos.

El proyecto utiliza Jest como herramienta para ejecutar pruebas automatizadas. Se priorizan las pruebas unitarias durante el desarrollo de cada módulo.

## 2. Objetivos

### Objetivo general

Definir un procedimiento común para desarrollar y ejecutar pruebas en el backend de VINTRA, garantizando que cada integrante pueda verificar el funcionamiento de su módulo antes de integrarlo con los demás.

### Objetivos específicos

- Establecer los comandos para ejecutar las pruebas automatizadas.
- Explicar cómo organizar y desarrollar pruebas unitarias.
- Definir los escenarios que deben verificarse en los servicios y controladores.
- Establecer criterios mínimos para considerar probado un módulo.
- Diferenciar las pruebas unitarias de las pruebas de integración con PostgreSQL.

## 3. Tipos de pruebas

### 3.1. Pruebas unitarias

Permiten comprobar el funcionamiento de una unidad específica del código, como un servicio o controlador, de manera aislada.

En VINTRA se utilizan dependencias simuladas (*mocks*) para probar servicios que interactúan con repositorios, otras dependencias o componentes externos.

Por ejemplo, en el módulo de vehículos se pueden verificar los siguientes escenarios:

- Registrar un vehículo correctamente.
- Rechazar un vehículo con información inválida.
- Consultar un vehículo existente.
- Generar una excepción cuando el vehículo no existe.
- Impedir operaciones que incumplan las reglas del negocio.

### 3.2. Pruebas de integración

Permiten verificar que varios componentes funcionen correctamente cuando interactúan entre sí.

En VINTRA se contemplan pruebas de integración para comprobar interacciones entre servicios, repositorios y PostgreSQL.

Estas pruebas requieren un entorno de pruebas independiente y autorizado. No deben ejecutarse sobre una base de datos compartida o de producción.

**Importante:** una prueba unitaria con repositorios simulados no demuestra que las consultas, relaciones, restricciones o triggers funcionen correctamente en PostgreSQL.

### 3.3. Pruebas de extremo a extremo (E2E)

Permiten comprobar el funcionamiento de la aplicación desde las solicitudes HTTP hasta las respuestas del backend, incluyendo la interacción entre sus componentes.

Se pueden utilizar para verificar procesos completos como autenticación, creación de asignaciones y consulta de seguimiento.

Su implementación y ejecución deben realizarse cuando el entorno de pruebas correspondiente esté preparado.

## 4. Organización de los archivos de pruebas

Los archivos de pruebas deben mantenerse organizados junto al código del módulo al que pertenecen.

Se utiliza la extensión `.spec.ts` para identificar los archivos de pruebas unitarias.

Ejemplo de organización:

```text
src/
├── vehiculos/
│   ├── vehiculos.controller.ts
│   ├── vehiculos.service.ts
│   ├── vehiculos.module.ts
│   └── vehiculos.service.spec.ts
│
├── personal/
│   ├── personal.controller.ts
│   ├── personal.service.ts
│   ├── personal.module.ts
│   └── personal.service.spec.ts
│
└── seguimiento/
    ├── seguimiento.controller.ts
    ├── seguimiento.service.ts
    ├── seguimiento.module.ts
    └── seguimiento.service.spec.ts
```

La ubicación y los nombres deben respetar la organización existente del proyecto.

## 5. Preparación del entorno

Antes de ejecutar las pruebas, cada integrante debe:

1. Tener instalado Node.js y npm en las versiones compatibles con el proyecto.
2. Contar con una copia actualizada del repositorio y ubicarse en la carpeta del backend.
3. Instalar las dependencias del proyecto cuando sea necesario.
4. Verificar que el entorno esté correctamente configurado.
5. Revisar los scripts disponibles en `package.json`.

Para instalar las dependencias:

```bash
npm install
```

Las pruebas unitarias que utilizan mocks no requieren necesariamente una conexión activa con PostgreSQL.

Las pruebas que dependan de una base de datos deben utilizar exclusivamente un entorno de pruebas autorizado.

## 6. Ejecución de pruebas

### 6.1. Ejecutar todas las pruebas

Desde la carpeta del backend:

```bash
npm test -- --runInBand
```

Este comando ejecuta las pruebas utilizando Jest y procesa los archivos de prueba de manera secuencial.

### 6.2. Ejecutar las pruebas de un módulo

Para ejecutar únicamente las pruebas de un módulo:

```bash
npm test -- --runInBand src/vehiculos/vehiculos.service.spec.ts
```

Se debe reemplazar la ruta por la ubicación del archivo que se desea probar.

### 6.3. Ejecutar varias pruebas específicas

También es posible indicar varios archivos:

```bash
npm test -- --runInBand src/vehiculos/vehiculos.service.spec.ts src/personal/personal.service.spec.ts
```

### 6.4. Verificar la compilación

Para comprobar que el backend compila correctamente:

```bash
npm run build
```

La compilación permite detectar errores de TypeScript y problemas relacionados con la construcción del proyecto. No reemplaza la ejecución de las pruebas.

### 6.5. Verificar el análisis estático

Cada integrante debe ejecutar el comando de análisis estático definido en los scripts del `package.json` y corregir los errores reportados.

## 7. Lineamientos para desarrollar pruebas unitarias

Cada integrante debe desarrollar pruebas para los comportamientos principales de su módulo.

Se recomienda comprobar:

**Escenarios exitosos:**
- La operación recibe información válida.
- El servicio procesa correctamente la solicitud.
- Se devuelve la respuesta esperada.

**Escenarios de error:**
- El recurso solicitado no existe.
- La información recibida es inválida.
- El usuario no tiene permisos suficientes.
- Se incumple una regla de negocio.
- Una dependencia genera un error.

**Reglas de negocio:**

Las pruebas deben comprobar las restricciones definidas en las historias de usuario y las decisiones funcionales del equipo.

Por ejemplo, en el módulo de asignaciones se deben verificar las restricciones de disponibilidad de vehículos y conductores, siempre de acuerdo con las relaciones existentes en el modelo de datos.

## 8. Ejemplo de una prueba unitaria

El siguiente ejemplo ilustra cómo organizar una prueba de un servicio que consulta un recurso.

```typescript
describe('VehiculosService', () => {
  describe('obtener', () => {
    it('debe retornar el vehículo cuando existe', async () => {
      // Preparar el vehículo simulado.
      // Configurar el repositorio simulado.
      // Ejecutar el método del servicio.
      // Verificar el resultado esperado.
    });

    it('debe lanzar una excepción cuando no existe', async () => {
      // Configurar el repositorio para no encontrar el vehículo.
      // Ejecutar el método del servicio.
      // Verificar la excepción esperada.
    });
  });
});
```

Este ejemplo es ilustrativo. Cada integrante debe adaptarlo a las dependencias y métodos reales de su módulo.

## 9. Criterios para considerar probado un módulo

Antes de entregar los cambios para revisión, el integrante debe comprobar que:

- Las pruebas unitarias del módulo se ejecutan correctamente.
- Se verifican los escenarios exitosos y los escenarios de error.
- Las reglas de negocio implementadas cuentan con pruebas.
- No se han eliminado ni alterado pruebas existentes sin justificación.
- El backend compila correctamente.
- El análisis estático no presenta errores pendientes.
- Los cambios no afectan el funcionamiento de otros módulos.

No basta con que una prueba pase: también debe comprobar el comportamiento que realmente exige la historia de usuario.

## 10. Consideraciones sobre PostgreSQL y el modelo de datos

El modelo de datos y las migraciones de la PR #115 constituyen la referencia de trabajo actual del equipo, mientras se encuentran pendientes de aprobación.

Por esta razón:

- No se deben ejecutar migraciones pendientes sobre bases de datos compartidas o de producción.
- No se deben modificar las relaciones ni las estructuras del modelo por iniciativa individual.
- Las pruebas que requieran PostgreSQL deben ejecutarse en un entorno independiente y autorizado.
- Los resultados de pruebas unitarias con mocks deben identificarse como tales y no presentarse como pruebas de integración.

## 11. Registro de resultados

Cada integrante debe informar los resultados de las pruebas realizadas cuando entregue su módulo para revisión.

Se recomienda registrar:

| Información | Descripción |
|---|---|
| Módulo | Nombre del módulo probado. |
| Archivos de prueba | Archivos `.spec.ts` ejecutados. |
| Pruebas ejecutadas | Cantidad de pruebas realizadas. |
| Pruebas aprobadas | Cantidad de pruebas exitosas. |
| Pruebas fallidas | Cantidad de pruebas que presentaron errores. |
| Compilación | Resultado de `npm run build`. |
| Observaciones | Errores pendientes o limitaciones identificadas. |

## 12. Responsabilidades de los integrantes

Cada integrante es responsable de:

1. Crear y mantener las pruebas de su módulo.
2. Verificar las reglas de negocio implementadas.
3. Ejecutar las pruebas antes de solicitar la integración.
4. Corregir los errores detectados.
5. Informar los resultados de las pruebas.
6. Evitar cambios que afecten otros módulos o el modelo de datos sin autorización.

## 13. Conclusión

La aplicación de estos lineamientos permite mantener un proceso de desarrollo organizado y verificable para VINTRA.

Cada integrante debe entregar su módulo acompañado de las pruebas correspondientes, facilitando la revisión, integración y mantenimiento del backend.

Las pruebas automatizadas son una herramienta fundamental para detectar errores tempranamente y aumentar la confiabilidad del sistema, aunque deben complementarse con pruebas de integración y E2E cuando los entornos correspondientes estén disponibles.

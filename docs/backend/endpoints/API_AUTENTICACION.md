# API_AUTENTICACION.md

# API de Autenticación y Control de Acceso – VINTRA

## 1. Descripción general

El módulo de Autenticación de VINTRA administra el inicio y cierre de sesión de los usuarios, la generación y validación de tokens JWT y el control de acceso a los recursos protegidos de la API.

Su responsabilidad principal es verificar la identidad de las cuentas y comprobar que tengan los permisos necesarios para ejecutar determinadas operaciones.

El módulo está desarrollado con NestJS, utiliza JWT para la autenticación, Argon2id para verificar contraseñas y TypeORM para consultar y persistir información relacionada con cuentas, perfiles y sesiones.

**Prefijo general:** `/api/v1/auth`

**Controlador:** `AutenticacionController`

**Servicio:** `AutenticacionService`

**Módulo:** `AutenticacionModule`

## 2. Endpoints disponibles

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Iniciar sesión y obtener un token JWT | Pública |
| POST | `/api/v1/auth/logout` | Cerrar sesión y revocar la sesión actual | JWT obligatorio |

No se identificaron endpoints implementados en este controlador para cambiar contraseñas, recuperar contraseñas o validar correos electrónicos.

## 3. Inicio de sesión

### 3.1. Información del endpoint

- **Método:** POST
- **Ruta:** `/api/v1/auth/login`
- **Autenticación:** No requiere JWT previo.
- **Código de éxito:** 200 OK.
- **Controlador:** `AutenticacionController.login()`
- **Servicio:** `AutenticacionService.login()`
- **DTO:** `IniciarSesionDto`

### 3.2. Headers

| Header | Valor | Obligatorio |
|---|---|---|
| Content-Type | application/json | Sí |

No requiere encabezado Authorization porque es el endpoint público de autenticación.

### 3.3. Body

```json
{
  "email": "persona@example.com",
  "password": "contraseña"
}
```

### 3.4. Validaciones

**Campo email:**
- Es obligatorio.
- Debe ser una cadena de texto.
- Debe cumplir el formato de correo electrónico.
- Longitud máxima: 254 caracteres.
- Se eliminan espacios al inicio y al final.
- Se convierte a minúsculas.

**Campo password:**
- Es obligatorio.
- Debe ser una cadena de texto.
- Longitud máxima: 128 caracteres.
- No se transforma ni se recortan sus espacios.

### 3.5. Respuesta exitosa

**Código HTTP:** 200 OK.

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Los 900 segundos corresponden al valor predeterminado de expiración. El tiempo puede modificarse mediante configuración.

### 3.6. Flujo interno

1. El controlador recibe las credenciales y la IP de la solicitud.
2. El servicio busca los datos del usuario mediante el correo normalizado.
3. Comprueba que exista una única coincidencia y que tenga una cuenta asociada.
4. Verifica que la cuenta esté activa y no se encuentre bloqueada.
5. Comprueba que el hash de la contraseña tenga el formato Argon2id.
6. Verifica la contraseña mediante `argon2.verify()`.
7. Genera un JWT con el identificador de la cuenta en la propiedad `sub`.
8. Obtiene el tiempo de expiración configurado.
9. Ejecuta la actualización y creación de la sesión dentro del contexto de auditoría.
10. Actualiza la fecha del último inicio de sesión.
11. Guarda una sesión con el hash SHA-256 del token, la IP y la fecha de expiración.
12. Devuelve el token de acceso y su duración.

### 3.7. Reglas de negocio

- Solo pueden iniciar sesión las cuentas activas.
- Las cuentas bloqueadas temporalmente no pueden autenticarse.
- La contraseña se verifica mediante Argon2id.
- Si el correo normalizado coincide con más de una cuenta, el acceso se rechaza.
- El token se genera después de verificar las credenciales.
- La sesión se registra en la base de datos.
- El token se almacena como hash SHA-256, no como token en texto plano.
- Una violación de unicidad al registrar la sesión se transforma en un conflicto HTTP.

### 3.8. Errores documentados

| Código | Significado |
|---|---|
| 400 | Solicitud con datos inválidos |
| 401 | Credenciales incorrectas o cuenta no autorizada para iniciar sesión |
| 409 | Conflicto de unicidad al registrar la sesión |

## 4. Cierre de sesión

### 4.1. Información del endpoint

- **Método:** POST
- **Ruta:** `/api/v1/auth/logout`
- **Autenticación:** JWT obligatorio.
- **Código de éxito:** 204 No Content.
- **Controlador:** `AutenticacionController.logout()`
- **Servicio:** `AutenticacionService.logout()`

### 4.2. Headers

| Header | Valor | Obligatorio |
|---|---|---|
| Authorization | Bearer `<jwt>` | Sí |

No se requiere un cuerpo de solicitud.

### 4.3. Flujo interno

1. El cliente envía el token JWT en el encabezado Authorization.
2. `JwtAuthGuard` verifica la firma, la expiración y la sesión asociada.
3. El guard incorpora el identificador de cuenta y de sesión a `request.user`.
4. El decorador `@UsuarioAutenticado()` obtiene esa identidad.
5. El controlador llama al servicio con el identificador de cuenta, el identificador de sesión y la IP.
6. El servicio busca la sesión correspondiente a esa cuenta, que todavía no debe estar revocada.
7. Actualiza `revocadoEn` con la fecha actual.
8. La operación se ejecuta dentro del contexto de auditoría.

### 4.4. Respuesta exitosa

**Código HTTP:** 204 No Content.

No devuelve cuerpo de respuesta.

### 4.5. Errores

| Código | Significado |
|---|---|
| 401 | Token ausente, inválido, expirado o sesión no válida |
| 404 | No se encuentra una sesión activa correspondiente a la cuenta |

## 5. Configuración JWT

La configuración se encuentra en `jwt.config.ts`.

| Parámetro | Valor o regla |
|---|---|
| JWT_SECRET | Obligatorio |
| Longitud mínima del secreto | 32 bytes |
| JWT_ACCESS_TOKEN_TTL_SECONDS | Configurable |
| Duración predeterminada | 900 segundos |
| Algoritmo de firma | HS256 |
| Algoritmos permitidos al verificar | HS256 |
| Identificador de cuenta | `sub` |

La función `getAccessTokenTtlSeconds()` valida que el tiempo de vida sea un entero positivo y seguro.

La función `createJwtOptions()` obtiene el secreto obligatorio y comprueba su longitud antes de registrar las opciones JWT.

### Ejemplo de configuración

```env
JWT_SECRET=<secreto_seguro_de_al_menos_32_bytes>
JWT_ACCESS_TOKEN_TTL_SECONDS=900
```

El secreto real no debe incluirse en documentación, repositorios ni registros.

## 6. Autenticación mediante JwtAuthGuard

Archivo: `jwt-auth.guard.ts`.

Este guard protege los endpoints que requieren una identidad autenticada.

### Validaciones realizadas

1. Comprueba que exista el encabezado Authorization.
2. Exige el esquema Bearer y un token con formato válido.
3. Verifica el JWT mediante JwtService.
4. Comprueba que `sub` tenga formato UUID.
5. Comprueba que `exp` sea numérico y que no haya expirado.
6. Calcula el hash SHA-256 del token.
7. Busca una sesión asociada al hash y que no esté revocada.
8. Comprueba que la sesión no haya expirado.
9. Comprueba que la sesión pertenezca a la cuenta indicada por `sub`.
10. Busca la cuenta y comprueba que esté activa y no bloqueada.
11. Actualiza la fecha de último uso de la sesión.
12. Incorpora la identidad autenticada a `request.user`.

### Información agregada a la solicitud

```typescript
{
  userId: string;
  sessionId: string;
}
```

Si alguna validación de autenticación falla, el guard rechaza la solicitud con HTTP 401 Unauthorized.

## 7. Autorización mediante RolesGuard

Archivo: `roles.guard.ts`.

Este guard comprueba si la cuenta autenticada posee alguno de los roles permitidos para ejecutar una operación.

### Funcionamiento

1. Lee los metadatos definidos mediante `@Roles()`.
2. Obtiene la identidad autenticada desde `request.user`.
3. Consulta los perfiles asociados a la cuenta.
4. Filtra los perfiles activos.
5. Comprueba si alguno coincide con los roles requeridos.
6. Permite la operación si existe coincidencia.
7. Rechaza el acceso con HTTP 403 Forbidden si no hay permisos suficientes.

La autorización se comprueba consultando los perfiles activos en la base de datos.

### Decorador Roles

Archivo: `roles.decorator.ts`.

```typescript
export const ROLES_KEY = 'vintra:roles';

export const Roles = (...roles: RolUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);
```

Este decorador permite declarar uno o varios roles autorizados en una clase o método.

Los roles concretos se definen en la entidad `Perfil`.

### Diferencia entre autenticación y autorización

| Concepto | Componente | Pregunta | Error |
|---|---|---|---|
| Autenticación | JwtAuthGuard | ¿Quién eres? | 401 |
| Autorización | RolesGuard | ¿Tienes permiso? | 403 |

## 8. Decorador UsuarioAutenticado

Archivo: `usuario-autenticado.decorator.ts`.

El decorador `@UsuarioAutenticado()` obtiene la identidad almacenada en `request.user`.

Se utiliza para que los controladores puedan recuperar los identificadores de la cuenta y de la sesión sin extraerlos manualmente del objeto Request.

Si no existe una identidad autenticada, genera una excepción Unauthorized.

La estructura de identidad se define en `authenticated-user.ts`:

```typescript
export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}
```

## 9. Entidades relacionadas

Las entidades se encuentran en `src/autenticacion/entidades`.

### 9.1. Sesion

Tabla: `session`.

Representa una sesión de usuario.

| Campo | Función |
|---|---|
| id | Identificador UUID |
| cuentaUsuario | Cuenta propietaria de la sesión |
| hashToken | Hash SHA-256 del JWT |
| ipSolicitud | Dirección IP de la solicitud |
| revocadoEn | Fecha de revocación; admite NULL |
| ultimoUsoEn | Fecha del último uso; admite NULL |
| expiraEn | Fecha de expiración |
| creadoEn | Fecha de creación |

Incluye índices por cuenta y expiración, restricción de unicidad sobre el hash del token y una restricción para que la expiración sea posterior a la creación.

### 9.2. TokenRecuperacion

Tabla: `password_reset_token`.

Entidad preparada para representar tokens de recuperación de contraseña.

Incluye:
- Identificador UUID.
- Cuenta asociada.
- Hash del token.
- IP de solicitud.
- Fecha de uso.
- Fecha de expiración.
- Fecha de creación.

Tiene restricciones de unicidad sobre el hash e índices por cuenta y expiración.

No se identificó un flujo de recuperación conectado a endpoints o servicios.

### 9.3. TokenValidacionCorreo

Tabla: `email_validation_token`.

Entidad preparada para representar tokens de validación de correo electrónico.

Incluye:
- Identificador UUID.
- Datos del usuario asociados.
- Correo electrónico.
- Hash del token.
- IP de solicitud.
- Fecha de uso.
- Fecha de expiración.
- Fecha de creación.

Tiene restricciones de unicidad sobre el hash e índices por usuario y expiración.

No se identificó un flujo de validación de correo conectado a endpoints o servicios.

## 10. DTO relacionados con funcionalidades de cuenta

| DTO | Campos y validaciones identificadas |
|---|---|
| IniciarSesionDto | email obligatorio, formato correo, máximo 254; password obligatorio, máximo 128 |
| CambiarContrasenaDto | currentPassword obligatorio, máximo 128; newPassword obligatorio, entre 12 y 128 caracteres |
| SolicitarRecuperacionDto | email obligatorio, formato correo, máximo 254, normalizado |
| RestablecerContrasenaDto | token obligatorio, máximo 512; newPassword y confirmPassword obligatorios, entre 12 y 128 caracteres |
| ValidarCorreoDto | token obligatorio, máximo 512 |

La igualdad entre `newPassword` y `confirmPassword` no se valida en el DTO revisado. Tampoco se identificó en él una regla de complejidad adicional para la nueva contraseña.

Los DTO de cambio y recuperación de contraseña y de validación de correo están definidos, pero no se encontraron conectados a controladores o servicios en la búsqueda realizada.

## 11. Auditoría

Las operaciones de inicio y cierre de sesión utilizan `ContextoAuditoriaService`.

El servicio ejecuta las operaciones mediante el contexto de auditoría, recibiendo el identificador del actor y la IP de la solicitud.

En el inicio de sesión se actualiza la fecha del último acceso y se registra la sesión.

En el cierre de sesión se actualiza la fecha de revocación.

La implementación detallada del registro de auditoría corresponde al módulo común de auditoría.

## 12. Pruebas

Se ejecutaron las pruebas específicas del módulo mediante:

```powershell
npm test -- --runInBand src/autenticacion
```

### Resultado de ejecución

- Suites aprobadas: 4.
- Suites fallidas: 0.
- Pruebas aprobadas: 11.
- Pruebas fallidas: 0.
- Tiempo de ejecución: 12.463 segundos.

### Archivos de pruebas

| Archivo | Cobertura identificada |
|---|---|
| autenticacion.controller.spec.ts | Ruta de inicio de sesión, respuesta HTTP y validación del cuerpo |
| autenticacion.service.spec.ts | Inicio exitoso, credenciales incorrectas, cuentas inactivas o bloqueadas y correos ambiguos |
| jwt-auth.guard.spec.ts | JWT válido, token ausente, inválido, expirado y mal formado |
| jwt.config.spec.ts | Secreto mínimo, algoritmo, duración configurable, duración predeterminada y configuración inválida |

### Alcance de las pruebas

Las pruebas utilizan objetos simulados para repositorios, servicios y componentes externos.

Por tanto, los resultados verifican los comportamientos cubiertos en pruebas unitarias y de controlador, pero no constituyen una prueba de integración completa con PostgreSQL, firma criptográfica real del JWT, persistencia real de sesiones ni ejecución de migraciones.

No se identificó un archivo específico de pruebas para `RolesGuard`.

## 13. Funcionalidades pendientes de conexión

Durante la revisión se identificaron estructuras definidas que todavía no tienen un flujo funcional conectado:

- Cambio de contraseña.
- Solicitud de recuperación de contraseña.
- Restablecimiento de contraseña.
- Validación de correo electrónico.

Se encontraron sus DTO y entidades correspondientes, pero no endpoints ni métodos de servicio que implementen estos procesos en el código revisado.

Por ello, no deben presentarse como funcionalidades disponibles de la API.

## 14. Archivos principales del módulo

```text
src/
└── autenticacion/
    ├── autenticacion.controller.ts
    ├── autenticacion.controller.spec.ts
    ├── autenticacion.module.ts
    ├── autenticacion.service.ts
    ├── autenticacion.service.spec.ts
    ├── authenticated-user.ts
    ├── jwt-auth.guard.ts
    ├── jwt-auth.guard.spec.ts
    ├── jwt.config.ts
    ├── jwt.config.spec.ts
    ├── roles.decorator.ts
    ├── roles.guard.ts
    ├── usuario-autenticado.decorator.ts
    ├── dto/
    │   ├── cambiar-contrasena.dto.ts
    │   ├── iniciar-sesion.dto.ts
    │   ├── respuesta-inicio-sesion.dto.ts
    │   ├── restablecer-contrasena.dto.ts
    │   ├── solicitar-recuperacion.dto.ts
    │   └── validar-correo.dto.ts
    ├── entidades/
    │   ├── sesion.entity.ts
    │   ├── token-recuperacion.entity.ts
    │   └── token-validacion-correo.entity.ts
    └── estrategias/
```

## 15. Consideraciones de implementación

- Las variables JWT deben mantenerse en el entorno seguro de configuración.
- Los tokens deben continuar almacenándose como hashes y no en texto plano.
- Los endpoints protegidos deben mantener la validación de sesión y estado de cuenta.
- Los permisos deben comprobarse mediante perfiles activos.
- Los cambios futuros en recuperación de contraseña y validación de correo requieren implementar y probar sus respectivos servicios y controladores.
- Las pruebas unitarias aprobadas no reemplazan las pruebas de integración con una base de datos real.

**Nota sobre el esquema de base de datos:** las entidades y sus restricciones representan la estructura definida en el código revisado. Las migraciones relacionadas continúan pendientes de aprobación; por tanto, no se debe asumir que el esquema está desplegado o confirmado en una base de datos compartida.

---

**Estado de revisión:** documentación elaborada con base en el código inspeccionado y las 11 pruebas aprobadas del módulo Autenticación.
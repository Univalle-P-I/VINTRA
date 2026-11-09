# Módulo de autenticación

Este documento describe los endpoints propuestos para gestionar la autenticación de usuarios en VINTRA, incluyendo el inicio y cierre de sesión, la consulta del usuario autenticado y la recuperación de contraseñas.

> **Pendiente de aprobación:** el mecanismo de autenticación y el contrato HTTP aún no están definidos (#54, #66 y #71). JWT/Bearer, los cuerpos y respuestas mostrados son propuestas; no deben considerarse decisiones implementadas.

## Contenido

1. [Iniciar sesión](#1-iniciar-sesión)
2. [Consultar usuario autenticado](#2-consultar-usuario-autenticado)
3. [Cerrar sesión](#3-cerrar-sesión)
4. [Solicitar recuperación de contraseña](#4-solicitar-recuperación-de-contraseña)
5. [Restablecer contraseña](#5-restablecer-contraseña)

---

## 1. Iniciar sesión

**Método:** `POST`

**Ruta:** `/api/v1/auth/login`

**Autenticación:** No requiere Bearer Token.

**Body:** Sí.

### 1.1. ¿Para qué sirve?

Permite que un usuario acceda a VINTRA mediante su correo electrónico y contraseña.

El backend recibe las credenciales, identifica la cuenta asociada al correo electrónico, verifica la contraseña y comprueba que la cuenta tenga permitido iniciar sesión.

Si las credenciales son correctas y la cuenta está habilitada, la propuesta genera una credencial de acceso, registra la sesión correspondiente y devuelve la información necesaria para que el usuario pueda acceder a los recursos autorizados. El mecanismo y el formato de esa credencial están pendientes de aprobación.

### 1.2. Encabezados HTTP

```http
Content-Type: application/json
Accept: application/json
```

### 1.3. Cuerpo de la solicitud

```json
{
  "email": "usuario@vintra.com",
  "password": "MiContrasena123!"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| email | string | Sí | Correo electrónico registrado en VINTRA. |
| password | string | Sí | Contraseña correspondiente a la cuenta del usuario. |

### 1.4. Respuesta exitosa — 200 OK

```json
{
  "accessToken": "jwt-token-generado",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "uuid-de-la-cuenta",
    "email": "usuario@vintra.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "operations_manager",
    "status": "active"
  }
}
```

La estructura de la respuesta, el tipo de token y su vigencia son ilustrativos y están pendientes de aprobación. Los valores ENUM del SQL también están marcados como marcadores de posición.

**Consideraciones:**

- `accessToken`: JWT generado por el backend.
- `tokenType`: tipo de autenticación utilizado.
- `expiresIn`: tiempo de vida del token expresado en segundos.
- `user.id`: identificador UUID de la cuenta.
- `user.email`: correo electrónico del usuario.
- `role`: información del rol asociado al perfil.
- `status`: estado de la cuenta.

### 1.5. Respuestas de error

| Código HTTP | Descripción |
|---|---|
| 400 Bad Request | Faltan campos obligatorios o el formato del correo no es válido. |
| 401 Unauthorized | El correo electrónico o la contraseña son incorrectos. |
| 403 Forbidden | La cuenta existe, pero su estado no permite iniciar sesión. |
| 423 Locked | Pendiente de acordar el código para una cuenta bloqueada. |
| 429 Too Many Requests | Pendiente de definir si se aplicará limitación y con qué política. |
| 500 Internal Server Error | Ocurrió un error inesperado durante el proceso de autenticación. |

### 1.6. Validaciones

El backend debe realizar las siguientes validaciones durante el inicio de sesión:

1. Comprobar que se hayan enviado los campos `email` y `password`.
2. Validar que el correo electrónico tenga un formato válido.
3. Normalizar el correo electrónico para realizar una búsqueda consistente, sin distinguir entre mayúsculas y minúsculas.
4. Buscar el correo en la tabla `user_data`.
5. Identificar la cuenta correspondiente en `user_account` mediante la relación entre sus identificadores UUID.
6. Verificar si la cuenta tiene un bloqueo temporal vigente mediante el campo `locked_until`.
7. Consultar el estado de la cuenta mediante `user_account.user_status`, que es un ENUM en el SQL.
8. Comparar la contraseña recibida con el hash almacenado en `user_account.pwd_hash`, utilizando el algoritmo de verificación correspondiente.
9. Si las credenciales son incorrectas, incrementar `failed_attempts` y evaluar la política de bloqueo.
10. Si las credenciales son correctas, reiniciar el contador de intentos fallidos.
11. Obtener el perfil activo y su valor `profile.user_role`, que es un ENUM en el SQL.
12. Actualizar el campo `last_login_at` con la fecha y hora del inicio de sesión.
13. Generar un JWT con la información necesaria para identificar al usuario y su sesión.
14. Registrar la sesión correspondiente en la tabla `session`.
15. Devolver el token de acceso y la información del usuario.

### 1.7. Reglas de negocio

- **RN-01. Acceso según el rol:** el usuario únicamente podrá acceder a las funcionalidades autorizadas para su rol.
- **RN-02. Integridad de datos:** la sesión debe quedar asociada a una cuenta existente.
- **RN-03. Autenticación:** el método de autenticación y el origen de identidad están pendientes de aprobación (#54, #71); el correo y la contraseña de este ejemplo son una propuesta.
- **RN-04. Protección de contraseñas:** las contraseñas deben almacenarse y verificarse mediante mecanismos de hash seguros. Nunca deben compararse ni almacenarse en texto plano.
- **RN-05. Estado de la cuenta:** únicamente las cuentas habilitadas podrán iniciar sesión.
- **RN-06. Control de intentos fallidos:** el sistema debe registrar los intentos fallidos y aplicar la política de bloqueo temporal definida.
- **RN-07. Registro de acceso:** cuando el inicio de sesión sea exitoso, debe actualizarse `last_login_at`.
- **RN-08. Gestión de sesiones:** cada inicio de sesión exitoso debe generar un registro asociado a la cuenta correspondiente.
- **RN-09. Protección de recursos:** el token generado debe permitir identificar al usuario y validar su acceso a los endpoints protegidos.
- **RN-10. Revocación de sesiones:** el sistema debe permitir invalidar sesiones cuando corresponda, por ejemplo, durante el cierre de sesión.

### 1.8. Seguridad y gestión del JWT

Se propone utilizar JSON Web Token (JWT) como mecanismo de autenticación para los endpoints protegidos. Esta propuesta no está aprobada; no debe asumirse JWT ni el esquema Bearer hasta cerrar #54 y #71.

El token debería incluir:

- `sub`: identificador UUID de la cuenta.
- `jti`: identificador único del token o sesión.
- `iat`: fecha de emisión.
- `exp`: fecha de expiración.

No se deben incluir contraseñas, hashes de contraseñas ni información sensible.

**Registro de sesiones**

Se propone almacenar el hash del token en `session.token_hash`, en lugar de guardar el JWT original.

El backend podrá validar el JWT y comprobar que la sesión asociada continúe activa. Esto permitirá gestionar la revocación de sesiones y evitar que un token revocado siga siendo aceptado.

La estructura definitiva dependerá de las columnas y restricciones de la tabla `session`.

### 1.9. Relación con la base de datos

| Tabla | Uso |
|---|---|
| `user_data` | Consultar el correo electrónico y los datos personales del usuario. |
| `user_account` | Consultar el hash de la contraseña, el estado de la cuenta y los datos de control de autenticación. |
| `profile` | Identificar el perfil activo y su campo ENUM `user_role`. |
| `session` | Registrar la sesión generada durante el inicio de sesión. |

En el SQL, `user_account.user_status` y `user_account.document_type` son ENUM, no tablas. `profile.user_role` también es un ENUM; el SQL no define una tabla `user_role` ni una tabla `user_status`. Los valores definidos en el SQL son marcadores de posición sujetos a confirmación.

---

## 2. Consultar usuario autenticado

**Método:** `GET`

**Ruta:** `/api/v1/auth/me`

**Autenticación:** Bearer Token (JWT).

**Body:** No requiere.

### 2.1. ¿Para qué sirve?

Este endpoint permite consultar la información del usuario que ha iniciado sesión en VINTRA.

Su finalidad es que el frontend pueda conocer qué usuario está utilizando el sistema, cuál es el estado de su cuenta y qué rol tiene asignado.

Esta información permitirá mostrar las opciones correspondientes y aplicar las restricciones de acceso según el rol del usuario autenticado.

### 2.2. Autenticación y encabezados HTTP

La propuesta requiere una sesión válida y una credencial en el encabezado `Authorization`. El esquema de autenticación y el formato del encabezado están pendientes de aprobación.

```http
Authorization: Bearer <access_token>
Accept: application/json
```

El backend deberá:

1. Recibir la credencial enviada en el encabezado `Authorization`, según el mecanismo que se apruebe.
2. Validar la credencial según el mecanismo aprobado.
3. Identificar la sesión correspondiente en la tabla `session`.
4. Verificar que la sesión no haya sido revocada (`revoked_at IS NULL`).
5. Comprobar que la sesión no haya expirado (`expires_at` debe ser posterior a la fecha y hora actual).
6. Identificar la cuenta asociada mediante `session.user_account_id`.
7. Consultar la información personal en `user_data`.
8. Obtener el estado desde `user_account.user_status`.
9. Obtener el perfil activo en `profile` y su campo `profile.user_role`.

### 2.3. Respuesta exitosa — 200 OK

Estructura propuesta basada en `user_account`, `user_data` y `profile`. Los valores de estado y rol son ejemplos de ENUM y su formato público queda pendiente del contrato común.

```json
{
  "id": "uuid-del-usuario",
  "documentId": "123456789",
  "firstName": "María",
  "lastName": "Montes",
  "email": "usuario@correo.com",
  "phone": "3001234567",
  "status": "active",
  "role": "operations_manager"
}
```

### 2.4. Respuestas de error

| Código HTTP | Descripción |
|---|---|
| 401 Unauthorized | No existe una sesión válida o no se proporcionó autenticación. |
| 403 Forbidden | El usuario está autenticado, pero no tiene permiso para acceder al recurso. |
| 500 Internal Server Error | Ocurrió un error inesperado en el servidor. |

### 2.5. Relación con la historia de usuario

**HU1 — Acceso según rol.**

Este endpoint permite identificar al usuario autenticado y obtener su rol para aplicar las restricciones de acceso correspondientes.

### 2.6. Validaciones

1. Verificar que se haya enviado el token JWT.
2. Validar la firma y vigencia del token.
3. Comprobar que corresponda a una sesión existente.
4. Verificar que `expires_at` no haya vencido.
5. Comprobar que `revoked_at` sea `NULL`.
6. Verificar el estado en `user_account.user_status`; los valores ENUM del SQL son marcadores de posición.
7. Consultar los datos personales asociados en `user_data`.
8. Obtener el perfil cuyo `is_active` sea `TRUE`.
9. Consultar el valor `profile.user_role`.

### 2.7. Reglas de negocio

- **RN-01. Acceso según rol:** el acceso a las funcionalidades debe corresponder al rol del usuario autenticado.
- **RN-02. Identificación del usuario:** la información del usuario debe obtenerse de la sesión validada, no de un identificador enviado por el frontend.
- **RN-03. Perfil activo:** solo se debe utilizar el perfil activo del usuario.
- **RN-04. Estado de la cuenta:** una cuenta inactiva no debe acceder a las funcionalidades protegidas del sistema.

### 2.8. Relación con la base de datos

| Tabla | Uso |
|---|---|
| `session` | Validar la sesión y comprobar su vigencia y revocación. |
| `user_account` | Obtener la cuenta, el documento y el estado del usuario. |
| `user_data` | Consultar nombres, apellidos, correo y teléfono. |
| `profile` | Identificar el perfil activo y su valor ENUM `user_role`. |

**Relaciones principales**

```text
session.user_account_id → user_account.id
user_data.id → user_account.id
profile.user_account_id → user_account.id
```

`user_account.user_status`, `user_account.document_type` y `profile.user_role` son campos ENUM, no relaciones a tablas de catálogos.

---

## 3. Cerrar sesión

**Método:** `POST`

**Ruta:** `/api/v1/auth/logout`

**Autenticación:** Bearer Token (JWT).

**Body:** No requiere.

### 3.1. ¿Para qué sirve?

Este endpoint permite que un usuario cierre su sesión de VINTRA de forma segura.

Cuando el usuario selecciona la opción de cerrar sesión, el frontend realiza una solicitud al backend. Este identifica la sesión actual y la revoca para impedir que el mismo token pueda seguir utilizándose.

El objetivo es finalizar el acceso del usuario y evitar que una sesión cerrada continúe siendo válida.

### 3.2. Autenticación y encabezados HTTP

Este endpoint requiere un Bearer Token válido.

```http
Authorization: Bearer <access_token>
Accept: application/json
```

El backend deberá recibir el token, validarlo mediante el mecanismo establecido, localizar la sesión correspondiente y verificar su vigencia antes de revocarla.

### 3.3. Funcionamiento

Cuando el usuario solicite cerrar sesión, el backend deberá:

1. Recibir el token enviado en el encabezado `Authorization`.
2. Validar que corresponda a una sesión existente y vigente.
3. Identificar la sesión asociada al token.
4. Actualizar el campo `revoked_at` de esa sesión con la fecha y hora del cierre.
5. Confirmar que la sesión quedó revocada.

**Importante:** se revoca únicamente la sesión actual, no todas las sesiones del usuario.

### 3.4. Respuesta exitosa — 204 No Content

No devuelve un cuerpo de respuesta. El código HTTP indica que la solicitud se procesó correctamente.

### 3.5. Respuestas de error

| Código HTTP | Descripción |
|---|---|
| 401 Unauthorized | Token ausente, inválido, expirado o sesión ya revocada. |
| 500 Internal Server Error | Error inesperado al procesar el cierre de sesión. |

### 3.6. Relación con la historia de usuario

**HU1 — Acceso según rol.**

Este endpoint permite finalizar de forma segura la sesión del usuario autenticado.

### 3.7. Validaciones

1. Verificar que se envíe el encabezado `Authorization`.
2. Comprobar que el token tenga el formato esperado.
3. Validar que corresponda a una sesión existente.
4. Verificar que la sesión no haya expirado.
5. Comprobar que `revoked_at` sea `NULL`.
6. Actualizar `revoked_at` con la fecha y hora actual.
7. Confirmar que la actualización se haya realizado correctamente.

### 3.8. Reglas de negocio

- **RN-01. Acceso por rol:** el cierre de sesión debe estar disponible para el usuario autenticado, independientemente del rol que tenga asignado.
- **RN-02. Revocación de sesión:** una sesión revocada no debe permitir nuevas solicitudes protegidas con el mismo token.
- **RN-03. Cierre individual:** cerrar una sesión no debe revocar automáticamente las demás sesiones del usuario.
- **RN-04. Integridad de sesión:** solamente se debe actualizar la sesión que corresponde al token presentado.
- **RN-05. Vigencia:** una sesión expirada o previamente revocada no debe tratarse como una sesión activa.

### 3.9. Relación con la base de datos

La operación afecta principalmente a la tabla `session`.

| Campo | Uso |
|---|---|
| `id` | Identifica el registro de sesión. |
| `user_account_id` | Identifica la cuenta propietaria de la sesión. |
| `token_hash` | Permite identificar la sesión mediante el mecanismo de validación del token. |
| `revoked_at` | Registra cuándo se revocó la sesión. |
| `expires_at` | Permite comprobar la vigencia de la sesión. |

---

## 4. Solicitar recuperación de contraseña

**Método:** `POST`

**Ruta:** `/api/v1/auth/forgot-password`

**Autenticación:** No requiere Bearer Token.

**Body:** Sí.

### 4.1. ¿Para qué sirve?

Este endpoint permite que una persona que ha olvidado su contraseña solicite recuperar el acceso a VINTRA.

El usuario proporciona su correo electrónico y el backend busca la cuenta asociada. Si cumple las condiciones para iniciar la recuperación, el sistema genera un token temporal y envía las instrucciones al correo registrado.

El objetivo es permitir que el usuario pueda recuperar el acceso sin necesidad de iniciar sesión.

### 4.2. Autenticación y encabezados HTTP

Este endpoint no requiere Bearer Token porque está dirigido a usuarios que no tienen acceso a su cuenta.

Sin embargo, debe implementar controles de seguridad para evitar solicitudes abusivas y proteger la información de los usuarios.

```http
Content-Type: application/json
Accept: application/json
```

### 4.3. Cuerpo de la solicitud

```json
{
  "email": "usuario@correo.com"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| email | string | Sí | Correo electrónico registrado en VINTRA. |

### 4.4. Funcionamiento del endpoint

El backend deberá realizar el siguiente proceso:

1. Recibir el correo electrónico.
2. Validar que el campo esté presente y tenga un formato válido.
3. Buscar el correo en la tabla `user_data`.
4. Identificar la cuenta asociada mediante la relación correspondiente.
5. Verificar que la cuenta cumpla las condiciones para recuperar la contraseña.
6. Generar un token de recuperación seguro y aleatorio.
7. Calcular el hash del token.
8. Registrar la solicitud en `password_reset_token`.
9. Establecer la fecha de expiración del token.
10. Enviar las instrucciones de recuperación al correo electrónico registrado.

### 4.5. Respuesta exitosa — 202 Accepted

```json
{
  "message": "Si el correo está registrado y la cuenta cumple las condiciones de recuperación, recibirás instrucciones para continuar."
}
```

### 4.6. Respuestas de error

| Código HTTP | Descripción |
|---|---|
| 400 Bad Request | El correo no fue proporcionado o no tiene un formato válido. |
| 429 Too Many Requests | Se superó el límite permitido de solicitudes de recuperación. |
| 500 Internal Server Error | Ocurrió un error inesperado durante el procesamiento. |

### 4.7. Validaciones

1. Verificar que el correo electrónico esté presente.
2. Comprobar que tenga un formato válido.
3. Buscar el correo en `user_data`.
4. Identificar correctamente la cuenta asociada.
5. Verificar que la cuenta cumpla las condiciones de recuperación.
6. Generar un token seguro y temporal.
7. Almacenar únicamente el hash del token.
8. Establecer una fecha de expiración.
9. Aplicar límites a las solicitudes.
10. Evitar revelar la existencia de cuentas mediante los mensajes de respuesta.

### 4.8. Reglas de negocio

- **RN-01. Seguridad de recuperación:** el proceso debe utilizar tokens seguros y temporales.
- **RN-02. Uso único:** cada token de recuperación solamente puede utilizarse una vez.
- **RN-03. Expiración:** un token vencido no debe permitir continuar con la recuperación.
- **RN-04. Protección de cuentas:** el sistema no debe revelar si un correo está registrado.
- **RN-05. Integridad de datos:** cada solicitud de recuperación debe estar relacionada con una cuenta existente.
- **RN-06. Protección contra abusos:** deben establecerse límites para evitar solicitudes excesivas.
- **RN-07. Entrega segura:** las instrucciones de recuperación deben enviarse al correo registrado en la cuenta.

### 4.9. Relación con la base de datos

| Tabla | Uso |
|---|---|
| `user_data` | Permite consultar el correo electrónico registrado. |
| `user_account` | Permite identificar la cuenta asociada y consultar su estado. |
| `user_account` | Permite consultar el estado de cuenta almacenado en el ENUM `user_status`. |
| `password_reset_token` | Almacena el hash del token, la cuenta asociada, la IP de solicitud, la expiración y la utilización del token. |

---

## 5. Restablecer contraseña

**Método:** `POST`

**Ruta:** `/api/v1/auth/reset-password`

**Autenticación:** No requiere Bearer Token. Requiere un token temporal de recuperación.

**Body:** Sí.

### 5.1. ¿Para qué sirve?

Permite que un usuario establezca una contraseña nueva cuando ha solicitado recuperar el acceso a su cuenta.

El sistema debe comprobar que el token de recuperación sea válido, que no haya expirado y que no se haya utilizado anteriormente.

Después de actualizar la contraseña, el sistema debe restablecer los datos de bloqueo de la cuenta y revocar las sesiones activas para garantizar que la contraseña anterior no siga permitiendo el acceso.

### 5.2. Autenticación y encabezados HTTP

No requiere una sesión activa ni un Bearer Token, porque está pensado para usuarios que no pueden iniciar sesión.

En su lugar, la solicitud debe incluir el token temporal de recuperación.

El backend deberá verificar que el token corresponda a una solicitud de recuperación válida y que esté asociado a una cuenta existente.

```http
Content-Type: application/json
Accept: application/json
```

### 5.3. Cuerpo de la solicitud

```json
{
  "token": "token-de-recuperacion",
  "newPassword": "NuevaClaveSegura123!",
  "confirmPassword": "NuevaClaveSegura123!"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| token | string | Sí | Token temporal recibido para recuperar la cuenta. |
| newPassword | string | Sí | Nueva contraseña que desea establecer el usuario. |
| confirmPassword | string | Sí | Confirmación de la nueva contraseña. Debe coincidir con `newPassword`. |

### 5.4. Respuesta exitosa — 204 No Content

No se devuelve un cuerpo de respuesta. El código indica que la contraseña se actualizó correctamente.

### 5.5. Respuestas de error

| Código HTTP | Descripción |
|---|---|
| 400 Bad Request | Faltan campos o la nueva contraseña no cumple la política establecida. |
| 401 Unauthorized | El token es inválido, expiró o ya fue utilizado. |
| 500 Internal Server Error | Ocurrió un error inesperado durante el proceso. |

### 5.6. Validaciones

Antes de actualizar la contraseña, el backend debe:

1. Verificar que se hayan enviado el token y los campos de contraseña.
2. Comprobar que las contraseñas coincidan.
3. Verificar que el token corresponda a un registro de recuperación válido.
4. Comprobar que el token no haya expirado.
5. Comprobar que el token no haya sido utilizado anteriormente.
6. Identificar la cuenta asociada al token mediante `user_account_id`.
7. Validar que la nueva contraseña cumpla la política de seguridad establecida.
8. Generar el hash de la nueva contraseña.
9. Actualizar `pwd_hash` en `user_account`.
10. Actualizar `password_changed_at` y `updated_at`.
11. Restablecer `failed_attempts` a `0`.
12. Establecer `locked_until` en `NULL`.
13. Marcar el token de recuperación como utilizado.
14. Revocar las sesiones activas asociadas a la cuenta.

### 5.7. Reglas de negocio

- **RN-01. Seguridad de recuperación:** la recuperación debe realizarse mediante un token temporal y verificable.
- **RN-02. Integridad de datos:** el token debe estar asociado a una cuenta existente.
- **RN-03. Uso único:** el token solamente puede utilizarse una vez.
- **RN-04. Vigencia del token:** la duración está pendiente de definición.
- **RN-05. Protección contra reutilización:** un token vencido o utilizado anteriormente no puede permitir otro cambio de contraseña.
- **RN-06. Protección de contraseñas:** la contraseña debe almacenarse como hash, nunca como texto plano.
- **RN-07. Política de contraseñas:** la nueva contraseña deberá cumplir la política de seguridad establecida.
- **RN-08. Revocación de sesiones:** después de cambiar la contraseña, se deben revocar todas las sesiones activas de esa cuenta.
- **RN-09. Notificación de seguridad:** el canal y el envío de notificaciones están pendientes de definición.
- **RN-10. Integridad de la operación:** la actualización de la contraseña, el uso del token y la revocación de sesiones se realizarán dentro de una misma transacción de base de datos.

### 5.8. Relación con la base de datos

| Tabla | Uso |
|---|---|
| `password_reset_token` | Verificar el token, su vencimiento y si ya fue utilizado. |
| `user_account` | Actualizar `pwd_hash`, `password_changed_at`, `updated_at`, `failed_attempts` y `locked_until`. |
| `session` | Revocar las sesiones activas de la cuenta. |

**Relaciones principales**

```text
password_reset_token.user_account_id → user_account.id

session.user_account_id → user_account.id
```

---

## Consideraciones generales del módulo

1. Los endpoints de autenticación deben proteger las credenciales, los tokens y la información de las cuentas.
2. Los JWT deben validarse en cada solicitud protegida.
3. Las sesiones revocadas o expiradas no deben permitir el acceso a los recursos protegidos.
4. Los tokens de recuperación deben ser seguros, temporales y de un solo uso.
5. Las contraseñas deben almacenarse utilizando mecanismos de hash seguros.
6. Los permisos asociados a los roles deben comprobarse en el backend, no solamente en el frontend.

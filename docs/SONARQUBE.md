# Análisis de calidad con SonarQube Cloud

El repositorio usa SonarQube Cloud para analizar el backend ASP.NET Core con
SonarScanner for .NET. El workflow `.github/workflows/sonarqube.yml` se ejecuta
en pull requests hacia `develop` o `main` y en pushes a esas ramas.

## Configuración en GitHub

En la organización o en el repositorio, abre **Settings → Secrets and
variables → Actions** y configura:

| Nombre | Tipo | Valor |
| --- | --- | --- |
| `SONAR_PROJECT_KEY` | Variable | `Univalle-P-I_VINTRA` |
| `SONAR_TOKEN` | Secreto | Un token cuya cuenta emisora tenga permiso para analizar el proyecto en SonarQube Cloud |

Si las variables son de organización, confirma que el repositorio VINTRA esté
incluido en el acceso. El workflow usa la clave de organización confirmada
`univalle-p-i`. SonarScanner for .NET conecta con SonarQube Cloud directamente,
por lo que no requiere `SONAR_HOST_URL`.

El token no otorga permisos por sí mismo: SonarQube Cloud evalúa los permisos de
la cuenta que lo generó. Para analizar VINTRA, esa cuenta debe tener
**Execute Analysis** en el proyecto.

Al subir un cambio a `develop` o `main`, o abrir un pull request hacia esas
ramas, revisa el job **SonarQube / Analyze backend** en la pestaña **Actions**.
El análisis actual cubre el backend .NET; el frontend React aún no está incluido.

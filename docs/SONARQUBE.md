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
| `SONAR_ORGANIZATION` | Variable requerida | La clave exacta de la organización en SonarQube Cloud |
| `SONAR_TOKEN` | Secreto | Un token con permiso para analizar el proyecto en SonarQube Cloud |

Si las variables son de organización, confirma que el repositorio VINTRA esté
incluido en el acceso. Obtén la clave de organización desde la URL de la página
de la organización (`https://sonarcloud.io/organizations/<clave>`) o desde la
sección **Project Information** del proyecto. No asumas que coincide con el
nombre de la organización de GitHub. SonarScanner for .NET conecta con
SonarQube Cloud directamente, por lo que no requiere `SONAR_HOST_URL`.

Al subir un cambio a `develop` o `main`, o abrir un pull request hacia esas
ramas, revisa el job **SonarQube / Analyze backend** en la pestaña **Actions**.
El análisis actual cubre el backend .NET; el frontend React aún no está incluido.

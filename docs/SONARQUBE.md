# Análisis de calidad con SonarQube Cloud

El repositorio usa SonarQube Cloud para analizar el backend NestJS/TypeScript con
`SonarSource/sonarqube-scan-action@v6`. El workflow `.github/workflows/sonarqube.yml` se ejecuta
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
`univalle-p-i`. La acción conecta con SonarQube Cloud directamente,
por lo que no requiere `SONAR_HOST_URL`.

El token no otorga permisos por sí mismo: SonarQube Cloud evalúa los permisos de
la cuenta que lo generó. Para analizar VINTRA, esa cuenta debe tener
**Execute Analysis** en el proyecto.

Al subir un cambio a `develop` o `main`, o abrir un pull request hacia esas
ramas, revisa el job **SonarQube / Analyze NestJS backend** en la pestaña **Actions**.
El análisis actual cubre `backend/src`; el frontend React aún no está incluido.

## Método y cobertura

Mantén desactivado **Automatic Analysis** en el proyecto de SonarQube Cloud: el análisis se ejecuta desde GitHub Actions y ambos métodos no deben activarse simultáneamente.

El workflow instala las dependencias, compila NestJS y ejecuta `npm run test:cov -- --runInBand`. La acción usa `backend` como directorio base e importa `coverage/lcov.info`, generado por Jest.

## Rama principal y plan

Si se mantiene el plan Free, configura `develop` como **Main Branch** dentro de SonarQube Cloud. Esa configuración es independiente de la rama predeterminada de GitHub y permite conservar `main` y `develop` en el repositorio.

Free permite consultar el análisis de la rama principal de Sonar y los PR dirigidos a ella. Un PR de `develop` hacia `main` se valida con CI; consultar su análisis específico en Sonar requiere un plan que incluya ese destino. Consulta los [planes de SonarQube Cloud](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans).

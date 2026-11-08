# Análisis de calidad con SonarQube Cloud

El workflow [`.github/workflows/sonarqube.yml`](../.github/workflows/sonarqube.yml) analiza el backend NestJS ubicado en `backend/`. Se ejecuta en Pull Requests hacia `develop` o `main` y en pushes a esas ramas.

## Configuración requerida en GitHub

En **Settings → Secrets and variables → Actions** configura:

| Nombre | Tipo | Uso |
| --- | --- | --- |
| `SONAR_TOKEN` | Secret | Token de una cuenta con permiso para analizar el proyecto. |
| `SONAR_PROJECT_KEY` | Variable | Clave del proyecto VINTRA en SonarQube Cloud. |

La organización se configura en el workflow como `univalle-p-i`. No compartas el token ni lo incluyas en `.env`, workflows o logs.

## Pasos del análisis

El job usa Node.js 24 y ejecuta desde `backend/`:

1. `npm ci`
2. `npm run build`
3. `npm run test:cov -- --runInBand`
4. SonarQube Scan sobre `src/`, con cobertura desde `coverage/lcov.info`.

El frontend todavía no forma parte de este análisis. Revisa el job **Analyze NestJS backend** y el Quality Gate del Pull Request; la existencia del workflow no implica que el análisis haya pasado.

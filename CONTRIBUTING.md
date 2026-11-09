# Contribuir a VINTRA

Esta guía describe el flujo vigente del repositorio. Las instrucciones de instalación y validación deben corresponder a las carpetas actuales del proyecto; si cambian los scripts o workflows, actualiza esta guía en el mismo PR.

## Preparación

```powershell
git clone https://github.com/Univalle-P-I/VINTRA.git
cd VINTRA
```

Configura `user.name` y `user.email` una sola vez si Git aún no conoce tu identidad.

## Flujo de trabajo

1. Actualiza `develop` y crea una rama de trabajo desde esa base.
2. Incluye el identificador de la tarjeta Trello enlazada desde el Issue en el nombre de rama, usando `feat/`, `fix/` o `docs/`, por ejemplo `feat/TRELLO-123-nombre-corto`. Si no existe una tarjeta aplicable, acuerda la referencia con Producto/Integración antes de crear la rama; no atribuyas a una tarjeta relacionada un alcance que no tiene.
3. Mantén el cambio acotado al Issue y no incluyas archivos locales ajenos. Usa commits pequeños con prefijos `feat:`, `fix:`, `docs:`, `test:` o `chore:`.
4. Abre un Pull Request hacia `develop`, enlaza el Issue (`Closes #56` cuando corresponda) y la tarjeta Trello, asigna una persona revisora y registra validaciones reales.
5. Atiende los comentarios y checks. Marca el Issue como terminado solo después de integrar el PR y satisfacer sus criterios.

```powershell
git switch develop
git pull origin develop
git switch -c feat/TRELLO-123-nombre-corto
```

No uses `git add .` en un árbol con otros cambios locales. Selecciona explícitamente los archivos del PR.

## Validaciones locales

Desde `frontend/`, con Node/npm disponibles:

```powershell
npm ci
npm run lint
npm test
npm run build
```

Desde `backend/`, con Node.js y npm disponibles:

```powershell
npm ci
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

El backend usa NestJS y estos scripts están definidos en `backend/package.json`. El workflow reutilizable `backend.yml` ejecuta lint, pruebas unitarias con cobertura, pruebas e2e con PostgreSQL y compilación. Ejecuta únicamente validaciones pertinentes al cambio y copia sus resultados en el PR. Para documentación/configuración, revisa también `git diff --check` y Markdown lint.

## Pull Request y evidencia

- Describe objetivo, alcance, decisiones y archivos afectados.
- Enlaza el Issue de origen y la tarjeta Trello correspondiente (si aplica).
- Registra comandos y resultados; nunca afirmes que una comprobación pasó si no se ejecutó.
- Adjunta captura para cambios visuales. Para backend, datos o CI, usa resultados/logs sanitizados; para documentación, el diff revisado es evidencia suficiente.
- Solicita revisión a alguien distinto del autor. No fusiones con checks fallidos o criterios pendientes.

## Automatizaciones disponibles

El workflow `ci.yml` verifica espacios en blanco, lint de Markdown, enlaces del README y llama a los workflows reutilizables de backend y frontend. Verifica el estado de cada job en el PR: que el workflow exista no demuestra por sí solo que el backend se haya compilado o probado.

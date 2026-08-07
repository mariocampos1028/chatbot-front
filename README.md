# ChatbotFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.33.

## Fase 3 — autenticación y rutas

El frontend se conecta al backend local en `http://localhost:8000` mediante
cookies `HttpOnly`. La URL se define en `src/app/core/api/api.config.ts`.

Incluye:

- Login, recuperación, creación y cambio obligatorio de contraseña.
- Interceptor que envía cookies con cada solicitud (`withCredentials`).
- Guards que separan Super Admin (`/admin/*`) y Business Owner (`/portal/*`).
- Layouts y rutas protegidas; las vistas de datos detalladas se construirán en
  las Fases 4 y 5.

Para probarlo localmente:

1. Inicia el backend FastAPI en el puerto `8000`.
2. Ejecuta `npm start` en esta carpeta.
3. Abre `http://localhost:4200/login`.
4. Inicia sesión con un Super Admin o Business Owner.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

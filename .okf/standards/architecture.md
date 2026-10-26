# Architecture Standard

## Frontend source layout

Keep the optional React/Vite demo organized by UI responsibility:

```text
frontend/src/
  routes/       route definitions, path constants, and navigation guards
  pages/        screen-level components, one per route
  components/   reusable layout, forms, lists, dialogs, and feedback UI
  contexts/     shared authenticated workspace state and actions
  services/     HTTP/API client code
  types/        shared API/domain types
  utils/        small reusable formatting and date helpers
```

Keep route guards as navigation behavior only; the backend remains the source
of truth for authentication, authorization, and booking rules.

Use the conventional Spring Boot layered architecture inside one modular
monolith. This keeps the design familiar and easy to follow without adding
Clean/Hexagonal Architecture, CQRS, or microservice patterns.

## Layers

```text
HTTP request
  -> Controller (routing, binding, response)
  -> Service (business rules and transaction boundary)
  -> Spring Data Repository (persistence queries)
  -> PostgreSQL
```

- Controllers handle HTTP concerns and delegate. They do not own business rules
  or persistence logic.
- Services enforce business behavior, authorization rules that depend on domain
  state, and transaction boundaries.
- Repositories own database access. Do not put HTTP types in this layer.
- Entities represent persisted data. Request/response DTOs define the API
  contract; do not return JPA entities directly.
- Cross-cutting concerns such as security, error handling, and configuration
  belong in `config` and `common`.
- Keep shared contract identifiers such as role names, API route roots, and
  persisted booking statuses in named constants under `common`; avoid repeating
  magic strings across controllers, services, entities, and security rules.

## Package organization

Keep the familiar layer-first package layout:

```text
com.dki.meetingroom/
  controller/
  service/
  repository/
  entity/
  dto/
    room/
    booking/
  common/
  config/
```

Entities belong in `entity/`, separate from controllers, services, and request
or response DTOs. DTOs may have feature subpackages to keep their names clear.

## Boundaries

- PostgreSQL is the source of truth for concurrency-sensitive booking overlap.
- React is a demonstration client. It must not own authorization or business rules.
- Avoid distributed infrastructure for this small coding-test scope.

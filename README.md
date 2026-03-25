## URL Shortener API

Lightweight Gin + GORM service that shortens URLs, stores uploaded files, and exposes simple auth endpoints. Default base URL is `http://localhost:8080`.

### Getting Started

1. Copy environment template and adjust secrets/DB creds:
	- `cp .env.example .env`
	- Set `JWT_SECRET` to a strong value.
2. Start dependencies (e.g. PostgreSQL) and run migrations if needed.
3. Launch the service: `go run ./cmd/main.go`.

### Authentication

| Method | Path        | Body Example                                           | Success Response |
|--------|-------------|--------------------------------------------------------|------------------|
| POST   | `/register` | `{ "email": "user@example.com", "password": "secret" }` | `200 { "message": "registered" }` |
| POST   | `/login`    | `{ "email": "user@example.com", "password": "secret" }` | `200 { "token": "<jwt>" }` |

Notes:
- Passwords are hashed with bcrypt before storage.
- `login` returns a JWT signed with `JWT_SECRET`; include it in subsequent requests if you add auth middleware later.

### URL Management

| Method | Path            | Purpose                             | Request Body                                      | Sample Response |
|--------|-----------------|-------------------------------------|--------------------------------------------------|-----------------|
| POST   | `/shorten`      | Create a short URL                  | `{ "url": "https://example.com/article" }`       | `200 { "short_url": "http://localhost:8080/abc123" }` |
| GET    | `/urls`         | List all stored URLs (latest first) | —                                                | `200 { "data": [ {"shortCode":"abc123", ...} ] }` |
| DELETE | `/urls/:code`   | Remove a short URL by code          | Path param `:code` (e.g. `abc123`)                | `204 No Content` or `404 { "error": "cannot delete url" }` |
| GET    | `/:code`        | Redirect to original URL            | Path param `:code`                               | `302` redirect or `404 { "error": "url not found" }` |

### File Storage

| Method | Path               | Purpose                    | Request Body                                                    | Sample Response |
|--------|--------------------|----------------------------|-----------------------------------------------------------------|-----------------|
| POST   | `/upload`          | Upload a file              | `multipart/form-data` field `file`                              | `200 { "file_url": "http://localhost:8080/files/<uuid>.ext" }` |
| GET    | `/files/:filename` | Download a stored file     | Path param `:filename` (UUID + original extension)              | Returns file stream or `404 { "error": "file not found" }` |

Files are saved under `storage/` with generated UUID filenames; original metadata is kept in the database.

### Environment Variables

| Key         | Description                         | Default |
|-------------|-------------------------------------|---------|
| `DB_HOST`   | PostgreSQL host                      | localhost |
| `DB_PORT`   | PostgreSQL port                      | 5432 |
| `DB_USER`   | PostgreSQL user                      | postgres |
| `DB_PASSWORD` | PostgreSQL password                | — |
| `DB_NAME`   | Database name                        | url_shortener |
| `DB_SSLMODE`| SSL mode (e.g. disable, require)     | disable |
| `JWT_SECRET`| Secret used to sign JWT tokens       | secret_key |

Adjust `.env` as needed before running in production.

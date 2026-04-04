# GMS Cloud - Link Shortener + Drive-like Storage
**React SPA + Go (Gin) API for link shortening, personal file storage, and public image delivery**  
_Backend: Go 1.22 + Gin + GORM | Frontend: React + Vite + TypeScript_

---
## 1. Getting Started

GMS Cloud is built around four core capabilities:
- Convert long URLs into short links.
- Store personal files in a drive-like folder structure.
- Expose public image endpoints for embedding in other applications.
- Provide REST APIs for integration with internal or external web/mobile apps.

### Clone the repository
```bash
git clone https://github.com/namduongit/gms-cloud
cd gms-cloud
```

### Project layout
Backend and frontend live in the same repository; the React client consumes the Go REST API directly.
```text
url-shorter/
├── client/ 					# Client side (React)
├── cmd/                        # Go entrypoints (main.go bootstraps Gin server)
├── internal/
│   ├── config/                 # AppConfig, env loader, Gin response helpers
│   ├── handler/                # Auth, URL, and file HTTP handlers
│   ├── middleware/             # JWT auth middleware
│   ├── repository/             # Database access layer (GORM)
│   ├── service/                # Business logic for URLs & files
│   └── utils/                  # JWT helpers, misc utilities
├── storage/                    # Uploaded file payloads
├── go.mod / go.sum             # Go module definition
└── README.md                   # You are here
```
---
## 2. Environment Configuration
- Duplicate `.env.example` to `.env` and fill in:
	- `HOST`, `PORT` for public base URL (e.g. `http://localhost:8080`).
	- PostgreSQL credentials (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
	- `JWT_SECRET` for signing access tokens.
- Optional: adjust URL/file limits in the seed data for user plans.

**Frontend**: create `web/.env` (or equivalent) with `VITE_API_BASE=http://localhost:8080` and enable `withCredentials` for Axios/fetch so cookies flow between SPA and API.

---
## 3. Core Features
- **JWT Authentication**: Sign in with an HttpOnly `accessToken` cookie and protect APIs per account.
- **URL Shortener**: Generate short codes for long URLs and manage links per user.
- **Drive-like File Storage**: Upload, list, delete, and organize files by folder.
- **Public Image Endpoint**: Serve images through public routes for display in websites/apps.
- **Plans & Limits**: Support plan-based limits (storage and URL count) for SaaS-style scaling.
- **Integration-ready API**: APIs are designed for both the current frontend and external integrations.

Detailed API documentation will be standardized with Swagger in the next step.

---
## 4. Running the Stack
### Docker Compose
```bash
docker compose up -d    # start API + database + client side
docker compose logs -f  # tail logs
```

### Local commands
- Backend (hot reload friendly): `go run ./cmd/main.go`
- Frontend (from `client/`): `npm install && npm run dev`

Use `golang-migrate` or `gorm.AutoMigrate` to keep the schema aligned with models.

---
## 5. Contact
- **Author**: Duong Nguyen
- **Email**: nguyennamduong205@gmail.com
- **GitHub**: [namduongit](https://github.com/namduongit)

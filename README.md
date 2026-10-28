# 🏛️ ArchivAries

![Platform](https://img.shields.io/badge/platform-Web-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.9-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-blue)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Requires](https://img.shields.io/badge/requires-Docker%20Compose-blue)
[![License](https://img.shields.io/badge/license-GPLv3-green)](LICENSE)

**Internal management platform for associations.**

ArchivAries brings an association's day-to-day work into one place: its members, events, documents, announcements and lore, with configurable roles and permissions. The interface is available in Spanish and Catalan.

---

## ✨ Features

- **Members**: member directory and profiles, with privacy settings and account activation by invitation.
- **Events**: event list and calendar, with attendance confirmation.
- **Documents**: documents organised by category.
- **Announcements**: news and notices for members.
- **Lore**: the association's own lore entries, with restricted entries for specific roles.
- **Roles and permissions**: dynamic roles with per-permission control from the admin panel.
- **Trash bin**: deleted content can be reviewed and restored.
- **i18n**: Spanish and Catalan, with Spanish as the fallback language.
- **Markdown**: rich content (descriptions, documents, announcements, lore) is written in Markdown.

---

## 🧱 Stack

| Part | Technologies |
|---|---|
| Backend | NestJS 11, Prisma 5, PostgreSQL 16, JWT authentication |
| Frontend | React 19, Vite, Tailwind CSS 4, TanStack Query, react-i18next |
| Deployment | Docker Compose: PostgreSQL, the API and nginx serving the frontend |

---

## 📁 Project structure

```
ArchivAries/
├── backend/                 # NestJS API (served under /api)
│   ├── prisma/              # Schema, migrations and seed
│   └── src/                 # Modules: auth, members, events, documents, news, lore, roles, trash…
├── frontend/                # React + Vite app
│   ├── public/locales/      # Translations (es, ca)
│   └── src/
├── docker-compose.yml       # Production stack
├── docker-compose.dev.yml   # PostgreSQL for local development
└── .env.example             # Configuration template
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and replace every placeholder value:

```sh
cp .env.example .env
```

- `POSTGRES_*` and `DATABASE_URL`: database name, user and password.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: two different long secrets (`openssl rand -base64 64`).
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`: the super-admin account created by the seed.
- `VITE_API_URL`: API URL baked into the frontend at build time.

The backend also reads `APP_URL`, `INVITE_EXPIRES_HOURS` and `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` for invitation emails. They are not in `.env.example` yet.

---

## 🚀 Running with Docker Compose

```sh
docker compose up -d --build
```

This starts PostgreSQL, the API and the web app. The web app is served at **http://localhost:8090**, and nginx forwards `/api` and `/uploads` to the API. Uploaded files are stored in `./uploads`.

---

## 🛠️ Development

The development setup uses [Bun](https://bun.sh/) and a PostgreSQL container published on port **5433**. Point `DATABASE_URL` in your `.env` to `localhost:5433`.

```sh
# Database
docker compose -f docker-compose.dev.yml up -d

# Backend (http://localhost:3000/api)
cd backend
bun install
bunx prisma migrate deploy
bun run seed
bun run start:dev

# Frontend (Vite dev server)
cd frontend
bun install
bun run dev
```

Project rules for contributors (i18n and the Markdown editor) are in [CLAUDE.md](CLAUDE.md).

---

## ⚖️ License

This project is licensed under the GPLv3 License — see the [LICENSE](LICENSE) file for details.

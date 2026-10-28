# ArchivAries — Backend

NestJS API for ArchivAries, served under `/api`. It uses Prisma with PostgreSQL.

See the [main README](../README.md) for configuration, running with Docker Compose and the development setup.

## Scripts

| Command | Description |
|---|---|
| `bun run start:dev` | Start the API in watch mode |
| `bun run build` | Build to `dist/` |
| `bun run seed` | Create the initial data and the super-admin account |
| `bun run lint` | Lint and fix the sources |
| `bun run test` | Unit tests |
| `bun run test:e2e` | End-to-end tests |

## License

GPLv3 — see the [LICENSE](../LICENSE) file.

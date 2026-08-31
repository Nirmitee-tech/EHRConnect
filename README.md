# EHRConnect

**An open-source EHR and hospital information platform built on FHIR R4.**

EHRConnect is a multi-tenant clinical and revenue-cycle system: patient records, scheduling, encounters, orders, beds, inventory and billing, sitting on a FHIR-native data layer so that clinical data is interoperable from the start rather than exported later.

It is built and maintained by [Nirmitee.io](https://nirmitee.io), a healthcare interoperability engineering team.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
![FHIR R4](https://img.shields.io/badge/FHIR-R4-orange.svg)

> **Status:** active development. Interfaces and schemas still change between releases. Review the [architecture notes](docs/system-architecture.md) and the [roadmap](docs/project-roadmap.md) before planning a deployment.

---

## Why it exists

Most hospital systems store clinical data in a proprietary schema and bolt FHIR on at the edge as an export format. That works until you need real interoperability — a SMART app, a payer integration, a health-information exchange — and then every mapping has to be rebuilt.

EHRConnect stores clinical data as FHIR resources natively, using [Medplum](https://www.medplum.com/) as the FHIR server, and keeps operational concerns (billing, inventory, beds, tenancy, RBAC) in a separate relational service. Clinical interoperability comes for free; operational data stays in a shape that is efficient to query and report on.

## Capabilities

**Clinical**
- Patient registration, demographics and longitudinal records
- Appointments, scheduling and patient flow
- Encounters, clinical notes and structured forms
- Order entry and results
- Bed and ward management
- Telehealth consultations
- Configurable clinical content per specialty and per country

**Revenue cycle**
- Eligibility verification
- Claims and superbills
- Prior authorization
- Remittance posting
- Billing masters and financial reporting

**Platform**
- Multi-tenant organizations and workspaces
- Keycloak-backed authentication with SSO and two-factor
- Role-based access control with granular permissions
- Medical code sets (ICD, CPT and related) with bulk import
- A form builder for custom intake and clinical templates
- Theming and white-labelling
- Task management and audit logging

## Architecture

| Service | Role | Stack |
|---|---|---|
| `ehr-web` | Clinician and administrator web application | Next.js, React, TypeScript |
| `ehr-api` | Operational API — tenancy, RBAC, billing, inventory, masters | Node.js, Express, PostgreSQL, Sequelize |
| `medplum-server` | FHIR R4 server and clinical data store | Medplum |
| `keycloak` | Identity, SSO, MFA, permission sync | Keycloak |
| `ehr-design-system` | Shared healthcare UI component library | React, Radix UI, Tailwind CSS |

PostgreSQL is the system of record for both the FHIR server and the operational API; Redis handles caching and background work.

```
                   ┌──────────────┐
                   │   ehr-web    │  Next.js
                   └──────┬───────┘
                          │
            ┌─────────────┼──────────────┐
            │             │              │
      ┌─────▼─────┐ ┌─────▼──────┐ ┌─────▼─────┐
      │  ehr-api  │ │  Medplum   │ │ Keycloak  │
      │ operations│ │  FHIR R4   │ │  identity │
      └─────┬─────┘ └─────┬──────┘ └─────┬─────┘
            └─────────────┼──────────────┘
                   ┌──────▼───────┐
                   │ PostgreSQL   │
                   │    Redis     │
                   └──────────────┘
```

## Quick start

Requires Docker and Docker Compose, plus Node.js 20+ if you want to run the web or API service outside a container.

```bash
git clone https://github.com/Nirmitee-tech/EHRConnect.git
cd EHRConnect

# Configure environment
cp .env.dev.example .env
# Edit .env — at minimum set DB_PASSWORD, KEYCLOAK_ADMIN_PASSWORD,
# NEXTAUTH_SECRET and JWT_SECRET to your own values.

# Bring up Postgres, Redis, Keycloak, Medplum and Mailhog
docker compose up -d

# Initialise the operational database
cd ehr-api
npm install
npm run db:setup     # run migrations
npm run db:seed      # load reference data
npm run seed:roles   # create default roles
npm run dev

# In a second terminal, start the web application
cd ../ehr-web
npm install
npm run dev
```

| Service | URL |
|---|---|
| Web application | http://localhost:3000 |
| Operational API | http://localhost:3001 |
| Medplum FHIR server | http://localhost:8103 |
| Keycloak | http://localhost:8080 |
| Mailhog (dev mail) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

The compose files for staging and production (`docker-compose.staging.yml`, `docker-compose.prod.yml`) and the Dokploy variants expect the same environment contract with production values supplied externally.

### Useful commands

```bash
# ehr-api
npm run db:status        # migration status
npm run db:reset         # drop and rebuild the operational schema
npm run seed:billing     # billing masters
npm run seed:providers   # provider directory
npm run sync:permissions # push permission definitions into Keycloak
npm test                 # Jest suite

# ehr-web
npm run build
npm run lint
npm run cypress          # end-to-end tests
```

## Documentation

- [System architecture](docs/system-architecture.md)
- [Project overview](docs/project-overview-pdr.md)
- [Roadmap](docs/project-roadmap.md)
- [Code standards](docs/code-standards.md)
- [Adding a new specialty](docs/adding-new-specialties.md)
- [Technology stack and performance notes](docs/technology-stack-performance-guide.md)
- [Module implementation notes](docs/implementation/)

## Configuration and security

The `.env.*.example` files list every variable the services read. **Every secret in them is a placeholder** — generate your own values for `NEXTAUTH_SECRET`, `JWT_SECRET`, `DB_PASSWORD` and the Keycloak admin credentials before running anywhere other than a local machine. The same applies to the signing keys in `medplum.config.json`.

EHRConnect is designed to run in environments handling protected health information, but deploying it compliantly is your responsibility: it is a software platform, not a certified or pre-configured compliant system. At minimum you will need TLS termination, encrypted storage, network isolation, log retention and a reviewed access-control configuration.

Never commit real patient data. All fixtures and seed files in this repository are synthetic.

## Contributing

Contributions are welcome. Please open an issue before starting substantial work, and see the organization-wide [contributing guidelines](https://github.com/Nirmitee-tech/.github/blob/main/CONTRIBUTING.md).

To report a security vulnerability, follow our [security policy](https://github.com/Nirmitee-tech/.github/blob/main/SECURITY.md) — email security@nirmitee.io rather than opening a public issue.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Medplum is used under its own license; see the [Medplum project](https://github.com/medplum/medplum) for terms.

## Commercial support

Nirmitee.io implements, extends and operates EHRConnect and other healthcare interoperability systems — HL7 v2, FHIR R4, X12 EDI, SMART on FHIR and Mirth Connect. If you need help deploying this or integrating it with an existing estate, [get in touch](https://nirmitee.io/contact).

# EHR Connect - Medplum FHIR + Next.js + Keycloak

A complete EHR (Electronic Health Record) system built with:
- **Next.js 15** with TypeScript and Tailwind CSS
- **Medplum FHIR Server** for healthcare data management
- **Keycloak** for authentication and authorization
- **PostgreSQL** for data storage
- **Redis** for caching

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ and npm

### 1. Start the Infrastructure Services

```bash
# Start all services (PostgreSQL, Redis, Keycloak, Medplum)
docker-compose up -d

# Check if all services are healthy
docker-compose ps
```

### 2. Wait for Services to Initialize

The services need time to start up:
- **PostgreSQL**: ~10 seconds
- **Redis**: ~5 seconds  
- **Keycloak**: ~60-90 seconds (first time)
- **Medplum**: ~30-60 seconds (after Keycloak is ready)

### 3. Start the Next.js Application

```bash
cd ehr-web
npm install  # if not already done
npm run dev
```

### 4. Access the Applications

- **Next.js App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Keycloak Admin**: http://localhost:8080 (admin/admin123)
- **Medplum FHIR Server**: http://localhost:8103

## 🔑 Authentication

### Default Users (Keycloak Realm: ehr-realm)

1. **Administrator**
   - Username: `admin`
   - Password: `admin123`
   - Roles: `admin`
   - FHIR User: `Practitioner/admin`

2. **Practitioner**
   - Username: `practitioner`
   - Password: `doctor123`
   - Roles: `practitioner`
   - FHIR User: `Practitioner/practitioner-1`

## 🏥 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│    Keycloak     │───▶│  Medplum FHIR   │
│  (Port: 3000)   │    │  (Port: 8080)   │    │  (Port: 8103)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◀───┤     Redis       │    │   File Storage  │
│  (Port: 5432)   │    │  (Port: 6379)   │    │   (./binary)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
EHRConnect/
├── docker-compose.yml           # Infrastructure services
├── init-db.sql                  # Database initialization
├── keycloak/
│   └── realm-export.json        # Keycloak realm configuration
├── medplum/
│   └── medplum.config.json      # Medplum server configuration
└── ehr-web/                     # Next.js application
    ├── src/
    │   ├── app/
    │   │   ├── api/auth/         # NextAuth.js API routes
    │   │   ├── dashboard/        # Dashboard page
    │   │   └── layout.tsx        # Root layout
    │   ├── components/           # React components
    │   ├── lib/
    │   │   ├── auth.ts           # NextAuth configuration
    │   │   ├── medplum.ts        # FHIR client & services
    │   │   └── utils.ts          # Utilities
    │   ├── providers/            # React providers
    │   └── types/                # TypeScript definitions
    └── .env.local                # Environment variables
```

## 🔧 Configuration

### Environment Variables (ehr-web/.env.local)

```bash
# Medplum Configuration
NEXT_PUBLIC_MEDPLUM_BASE_URL=http://localhost:8103
MEDPLUM_CLIENT_ID=medplum-client
MEDPLUM_CLIENT_SECRET=medplum-secret-key

# Keycloak Configuration  
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
KEYCLOAK_CLIENT_SECRET=nextjs-secret-key

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# FHIR Configuration
NEXT_PUBLIC_FHIR_SERVER_URL=http://localhost:8103/fhir/R4
```

## 🧪 Testing the Setup

1. **Visit Dashboard**: Go to http://localhost:3000/dashboard
2. **Authentication**: Click "Sign In with Keycloak"
3. **Login**: Use `admin`/`admin123` or `practitioner`/`doctor123`
4. **FHIR Data**: The dashboard will attempt to load FHIR resources

## 🛠 Development Commands

```bash
# Infrastructure
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs [service] # View service logs

# Next.js Development
cd ehr-web
npm run dev                   # Start development server
npm run build                 # Build for production
npm run lint                  # Run ESLint

# Add shadcn/ui components
npx shadcn@latest add [component]
```

## 🩺 FHIR Operations

The system provides a comprehensive FHIR service layer:

```typescript
import { fhirService } from '@/lib/medplum'

// Patient operations
const patients = await fhirService.getPatients({ _count: 10 })
const patient = await fhirService.getPatientById('patient-id')
const newPatient = await fhirService.createPatient(patientData)

// Practitioner operations
const practitioners = await fhirService.getPractitioners()
const practitioner = await fhirService.getPractitionerById('practitioner-id')

// Clinical data
const observations = await fhirService.getPatientObservations('patient-id')
const encounters = await fhirService.getPatientEncounters('patient-id')
const medications = await fhirService.getPatientMedications('patient-id')
```

## 🔍 Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker logs
   ```bash
   docker-compose logs keycloak
   docker-compose logs medplum-server
   ```

2. **Authentication errors**: Verify Keycloak is fully initialized
   - Visit http://localhost:8080
   - Login to admin console (admin/admin123)
   - Check that ehr-realm exists

3. **FHIR connection issues**: Check Medplum server health
   ```bash
   curl http://localhost:8103/healthcheck
   ```

4. **Database connection errors**: Ensure PostgreSQL is running
   ```bash
   docker-compose exec postgres pg_isready -U medplum
   ```

### Reset Everything

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all containers and images (optional)
docker system prune -a

# Start fresh
docker-compose up -d
```

## 🚀 Production Deployment

For production deployment, update the following:

1. **Security**: Change all default passwords and secrets
2. **SSL/TLS**: Enable HTTPS for all services
3. **Domain**: Update URLs to use production domains
4. **Database**: Use managed PostgreSQL service
5. **Storage**: Configure proper file storage (S3, etc.)
6. **Monitoring**: Add logging and monitoring solutions

docker-compose up --detach --build

## 📚 Documentation

- [Medplum Documentation](https://docs.medplum.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

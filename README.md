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

### Quick Production Setup (New Machine)

**One-command deployment:**
```bash
./production-deploy.sh
```

This automated script will:
1. ✅ Check prerequisites (Node.js, Docker)
2. ✅ Install theme dependencies
3. ✅ Build custom Keycloak theme
4. ✅ Start all Docker services
5. ✅ Deploy theme to Keycloak
6. ✅ Configure and restart services
7. ✅ Verify deployment

**Time:** ~3-4 minutes for complete setup

### Manual Production Steps

If you prefer step-by-step control:

```bash
# 1. Clone repository
git clone https://github.com/Nirmitee-tech/EHRConnect.git
cd EHRConnect

# 2. Build custom Keycloak theme
cd keycloak-theme
npm install
npm run build-keycloak-theme
cp dist_keycloak/*.jar ../keycloak/themes/
cd ..

# 3. Start services
docker-compose up -d

# 4. Wait for initialization (60 seconds)
sleep 60

# 5. Deploy theme to Keycloak
docker cp keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
docker-compose restart keycloak
```

### 📖 Complete Production Guide

For comprehensive production deployment including:
- Cloud deployment (AWS, Azure, GCP)
- Kubernetes setup
- SSL/TLS configuration
- Security hardening
- Monitoring & scaling
- Backup & restore

**See:** `keycloak-theme/PRODUCTION_DEPLOYMENT.md`

### Production Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/SSL for all services
- [ ] Configure production domains
- [ ] Set up managed database (RDS, Cloud SQL, etc.)
- [ ] Configure proper CORS origins
- [ ] Set up email SMTP for Keycloak
- [ ] Enable security features (2FA, brute force protection)
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Review security best practices
- [ ] Test complete authentication flow
- [ ] Load test critical endpoints

### Custom Keycloak Theme

The project includes an enterprise-grade custom Keycloak theme:
- **Split-screen design** with medical illustrations
- **EHR Connect branding** with gradient logo
- **Professional SVG icons** (no emojis)
- **Animated elements** and transitions
- **HIPAA/FHIR feature badges**
- **Fully responsive** design

**Development:**
```bash
cd keycloak-theme
npm run dev:keycloak  # Hot reload at http://localhost:5173
```

**Deploy updates:**
```bash
cd keycloak-theme
npm run deploy  # Automated deployment to Docker
```

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

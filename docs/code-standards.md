# Code Standards & Codebase Structure

**Last Updated**: 2025-12-15
**Version**: 1.0.0
**Applies To**: All code within EHRConnect project

## Overview

This document defines coding standards, file organization patterns, naming conventions, and best practices for EHRConnect. All code must adhere to these standards to ensure consistency, maintainability, and quality.

## Core Development Principles

### YANGI (You Aren't Gonna Need It)
- Avoid over-engineering and premature optimization
- Implement features only when needed
- Don't build infrastructure for hypothetical future requirements
- Start simple, refactor when necessary

### KISS (Keep It Simple, Stupid)
- Prefer simple, straightforward solutions
- Avoid unnecessary complexity
- Write code that's easy to understand and modify
- Choose clarity over cleverness

### DRY (Don't Repeat Yourself)
- Eliminate code duplication
- Extract common logic into reusable functions/modules
- Use composition and abstraction appropriately
- Maintain single source of truth

## File Organization Standards

### Directory Structure

```
EHRConnect/
├── ehr-api/                      # Backend Node.js API
│   └── src/
│       ├── config/              # Configuration files
│       ├── constants/           # Application constants
│       ├── controllers/         # Request handlers
│       ├── database/            # Database setup & migrations
│       │   ├── migrations/      # SQL migration files
│       │   └── seed-scripts/    # Database seeding
│       ├── integrations/        # External integrations
│       ├── middleware/          # Express middleware
│       ├── routes/              # API route definitions
│       ├── services/            # Business logic layer
│       ├── scripts/             # Utility scripts
│       └── utils/               # Utility functions
│
├── ehr-web/                      # Frontend Next.js application
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # Reusable React components
│       ├── contexts/            # React Context providers
│       ├── services/            # API client services
│       ├── types/               # TypeScript type definitions
│       ├── utils/               # Utility functions
│       └── hooks/               # Custom React hooks
│
├── ehr-design-system/            # Shared UI component library
├── ehr-integration-gateway/     # Integration service
├── keycloak/                    # Keycloak configs
├── keycloak-theme/              # Custom Keycloak theme
├── medplum/                     # Medplum FHIR configs
├── scripts/                     # Deployment scripts
├── infra/                       # Infrastructure configs
└── docs/                        # Documentation
```

### File Naming Conventions

**Backend (ehr-api)**:
- **General**: Use kebab-case: `user-service.js`, `patient-route.js`
- **Services**: `*.service.js` (e.g., `auth.service.js`, `patient.service.js`)
- **Routes**: `*.routes.js` or `*.js` in `routes/` (e.g., `patients.js`)
- **Controllers**: `*.controller.js` or `*.js` in `controllers/`
- **Middleware**: `*.js` in `middleware/` (e.g., `auth.js`, `rbac.js`)
- **Migrations**: `YYYYMMDDHHMMSS-description.js` (e.g., `20240101000000-initial-schema.js`)
- **Handlers**: `*.handler.js` (e.g., `abdm.handler.js`)

**Frontend (ehr-web)**:
- **General**: Use kebab-case for files: `patient-list.tsx`, `api-client.ts`
- **Pages**: `page.tsx` in App Router directories
- **Layouts**: `layout.tsx`
- **Components**: `PascalCase.tsx` (e.g., `PatientCard.tsx`, `AppointmentForm.tsx`)
- **Services**: `*.service.ts` (e.g., `auth.service.ts`)
- **Types**: `*.types.ts` or `*.ts` in `types/` directory
- **Contexts**: `*-context.tsx` (e.g., `specialty-context.tsx`)
- **Hooks**: `use-*.ts` (e.g., `use-patients.ts`)

**Configuration Files**:
- `.env` for environment variables
- `.env.example` for environment variable templates
- `package.json` for dependencies
- `tsconfig.json` for TypeScript
- `next.config.ts` for Next.js
- `tailwind.config.js` for Tailwind CSS

## Coding Standards

### JavaScript/Node.js (Backend)

**File Structure**:
```javascript
// 1. External dependencies
const express = require('express');
const { Pool } = require('pg');

// 2. Internal dependencies
const authService = require('./services/auth.service');
const { validateRequest } = require('./utils/validation');

// 3. Constants
const PORT = process.env.PORT || 8000;
const MAX_RETRIES = 3;

// 4. Main code
class PatientService {
  // Implementation
}

// 5. Exports
module.exports = { PatientService };
```

**Naming Conventions**:
- **Variables**: camelCase (`patientId`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_PAGE_SIZE`)
- **Functions**: camelCase (`getPatient`, `createAppointment`)
- **Classes**: PascalCase (`PatientService`, `AuthMiddleware`)
- **Private methods**: prefix with `_` (`_validateInput`, `_formatResponse`)

**Functions**:
- Keep functions small (< 50 lines)
- Single responsibility principle
- Use descriptive names
- Use async/await over promises
- Handle errors explicitly

**Example**:
```javascript
/**
 * Get patient by ID
 * @param {string} patientId - Patient identifier
 * @param {string} orgId - Organization identifier
 * @returns {Promise<Object>} Patient object
 * @throws {Error} If patient not found
 */
async function getPatient(patientId, orgId) {
  if (!patientId || !orgId) {
    throw new Error('Patient ID and Org ID required');
  }

  const patient = await db.query(
    'SELECT * FROM patients WHERE id = $1 AND org_id = $2',
    [patientId, orgId]
  );

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
}
```

### TypeScript/React (Frontend)

**File Structure**:
```typescript
// 1. React and external dependencies
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal dependencies
import { patientService } from '@/services/patient.service';
import { PatientCard } from '@/components/PatientCard';

// 3. Types
interface PatientListProps {
  orgId: string;
  limit?: number;
}

// 4. Component
export default function PatientList({ orgId, limit = 10 }: PatientListProps) {
  // Implementation
}
```

**TypeScript Standards**:
- Use TypeScript strict mode
- Define interfaces for all props and data structures
- Avoid `any` type (use `unknown` if necessary)
- Use type inference where obvious
- Export types/interfaces for reuse

**Naming Conventions**:
- **Variables**: camelCase (`patientData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_FILE_SIZE`)
- **Functions**: camelCase (`handleSubmit`, `fetchPatients`)
- **Components**: PascalCase (`PatientList`, `AppointmentCard`)
- **Types/Interfaces**: PascalCase (`PatientData`, `AppointmentFormProps`)
- **Enums**: PascalCase (`AppointmentStatus`, `UserRole`)

**React Component Standards**:
- Use functional components
- Use hooks for state and side effects
- Extract complex logic into custom hooks
- Use TypeScript for props
- Keep components small (< 300 lines)
- Separate container and presentational components

**Example**:
```typescript
interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    dateOfBirth: string;
  };
  onClick?: (id: string) => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const handleClick = () => {
    onClick?.(patient.id);
  };

  return (
    <div onClick={handleClick} className="patient-card">
      <h3>{patient.name}</h3>
      <p>DOB: {patient.dateOfBirth}</p>
    </div>
  );
}
```

### SQL Standards

**Naming Conventions**:
- **Tables**: snake_case, plural (`patients`, `appointments`, `audit_logs`)
- **Columns**: snake_case (`first_name`, `created_at`, `org_id`)
- **Primary Keys**: `id` (UUID)
- **Foreign Keys**: `{table}_id` (`patient_id`, `org_id`)
- **Junction Tables**: `{table1}_{table2}` (`user_roles`, `patient_episodes`)
- **Indexes**: `idx_{table}_{column}` (`idx_patients_org_id`)
- **Constraints**: `{table}_{column}_{type}` (`patients_email_unique`)

**Migration Files**:
```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      org_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        }
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('patients', ['org_id'], {
      name: 'idx_patients_org_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patients');
  }
};
```

## Best Practices

### Error Handling

**Backend**:
```javascript
// Bad
async function getPatient(id) {
  const patient = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
  return patient;
}

// Good
async function getPatient(id) {
  try {
    if (!id) {
      throw new Error('Patient ID required');
    }

    const patient = await db.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
}
```

**Frontend**:
```typescript
// Bad
async function fetchPatients() {
  const response = await fetch('/api/patients');
  const data = await response.json();
  return data;
}

// Good
async function fetchPatients(): Promise<Patient[]> {
  try {
    const response = await fetch('/api/patients');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    throw error;
  }
}
```

### Input Validation

**Backend (using Joi)**:
```javascript
const Joi = require('joi');

const patientSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  dateOfBirth: Joi.date().max('now').required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional()
});

async function createPatient(req, res) {
  const { error, value } = patientSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Create patient with validated data
  const patient = await patientService.create(value);
  return res.status(201).json(patient);
}
```

### Security Practices

**1. SQL Injection Prevention**:
```javascript
// Bad
const query = `SELECT * FROM patients WHERE name = '${name}'`;

// Good
const query = 'SELECT * FROM patients WHERE name = $1';
const result = await db.query(query, [name]);
```

**2. XSS Prevention**:
```typescript
// Backend - sanitize inputs
import DOMPurify from 'isomorphic-dompurify';

const cleanInput = DOMPurify.sanitize(userInput);

// Frontend - use React's built-in escaping
<div>{patientName}</div> // Automatically escaped
```

**3. Authentication**:
```javascript
// Middleware for protected routes
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
```

### Performance Optimization

**1. Database Queries**:
```javascript
// Bad - N+1 query problem
for (const patient of patients) {
  const appointments = await db.query(
    'SELECT * FROM appointments WHERE patient_id = $1',
    [patient.id]
  );
}

// Good - Single query with JOIN
const patientsWithAppointments = await db.query(`
  SELECT p.*, json_agg(a.*) as appointments
  FROM patients p
  LEFT JOIN appointments a ON a.patient_id = p.id
  GROUP BY p.id
`);
```

**2. Frontend Data Fetching**:
```typescript
// Use SWR for caching and revalidation
import useSWR from 'swr';

function PatientList() {
  const { data, error, isLoading } = useSWR(
    '/api/patients',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <PatientTable patients={data} />;
}
```

**3. Code Splitting**:
```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Testing Standards

**Backend Unit Test (Jest)**:
```javascript
describe('PatientService', () => {
  describe('getPatient', () => {
    it('should return patient when found', async () => {
      const mockPatient = { id: '123', name: 'John Doe' };
      db.query = jest.fn().mockResolvedValue(mockPatient);

      const result = await patientService.getPatient('123');

      expect(result).toEqual(mockPatient);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['123']
      );
    });

    it('should throw error when patient not found', async () => {
      db.query = jest.fn().mockResolvedValue(null);

      await expect(patientService.getPatient('999'))
        .rejects
        .toThrow('Patient not found');
    });
  });
});
```

**Frontend Component Test**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientCard } from './PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '123',
    name: 'John Doe',
    dateOfBirth: '1990-01-01'
  };

  it('renders patient information', () => {
    render(<PatientCard patient={mockPatient} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/1990-01-01/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PatientCard patient={mockPatient} onClick={handleClick} />);

    fireEvent.click(screen.getByText('John Doe'));

    expect(handleClick).toHaveBeenCalledWith('123');
  });
});
```

## Code Comments

### When to Comment

**DO comment**:
- Complex algorithms or business logic
- Non-obvious decisions or workarounds
- Public API functions (JSDoc)
- Regex patterns
- Magic numbers or constants
- FHIR resource mapping

**DON'T comment**:
- Obvious code
- What the code does (code should be self-explanatory)
- Commented-out code (delete it)

### Comment Style

**JSDoc for Functions**:
```javascript
/**
 * Calculate patient age from date of birth
 * @param {string} dateOfBirth - ISO 8601 date string
 * @returns {number} Age in years
 * @throws {Error} If date is invalid
 */
function calculateAge(dateOfBirth) {
  // Implementation
}
```

**Inline Comments**:
```javascript
// FHIR R4 requires identifier system to be a valid URI
const identifierSystem = 'http://hl7.org/fhir/sid/us-ssn';

// Retry up to 3 times with exponential backoff
// to handle transient network errors
for (let i = 0; i < MAX_RETRIES; i++) {
  // Implementation
}
```

## Git Commit Standards

### Conventional Commits

Format: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

**Examples**:
```
feat(patients): add FHIR Patient resource support
fix(appointments): correct timezone handling
docs(api): update API endpoint documentation
refactor(auth): simplify JWT validation logic
perf(database): add index on patient org_id
test(billing): add ClaimMD integration tests
```

### Commit Message Guidelines

- Use present tense ("add feature" not "added feature")
- Capitalize first letter
- No period at the end
- Limit subject line to 72 characters
- Separate subject from body with blank line
- Use body to explain what and why, not how

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] No console.log() or debug code
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Comments added where necessary
- [ ] Types defined (TypeScript)
- [ ] No secrets or API keys in code

### Code Review Focus Areas

- **Functionality**: Does code work as intended?
- **Security**: Any security vulnerabilities?
- **Performance**: Any performance issues?
- **Maintainability**: Is code easy to understand and modify?
- **Testing**: Adequate test coverage?
- **Standards**: Follows coding standards?

## Environment Variables

### Naming Convention

- Use UPPER_SNAKE_CASE
- Prefix with component: `DATABASE_URL`, `REDIS_HOST`
- Group related vars: `KEYCLOAK_URL`, `KEYCLOAK_REALM`

### Required Variables

**Backend (.env)**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ehrconnect
REDIS_URL=redis://localhost:6379

# Server
PORT=8000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ehrconnect

# FHIR
MEDPLUM_BASE_URL=http://localhost:8103

# Integrations
TWILIO_ACCOUNT_SID=your-sid
HMS_APP_ID=your-app-id
```

**Frontend (.env.local)**:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
AUTH_PROVIDER=postgres

# Keycloak (if using)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehrconnect
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ehr-web
```

## Documentation Standards

### Code Documentation

- **Backend Services**: JSDoc comments
- **Frontend Components**: TypeScript interfaces + comments
- **API Endpoints**: Inline comments + API docs
- **Database Schema**: Migration comments

### README Files

Each major module should have a README with:
- Purpose and overview
- Installation instructions
- Usage examples
- API reference (if applicable)
- Configuration options
- Testing instructions

## Unresolved Questions

1. Linting configuration (ESLint/Prettier) - to be standardized
2. Pre-commit hooks (Husky) - to be configured
3. Code coverage targets - to be defined
4. API documentation tool (Swagger/OpenAPI) - to be selected
5. Frontend component documentation (Storybook) - to be evaluated

# EHR Connect - Architecture Documentation

## 🏗️ Architecture Overview

This document describes the refactored architecture of the EHR Connect patient detail system, following SOLID principles and best practices for maintainability and extensibility.

## 📁 Project Structure

```
ehr-web/src/
├── app/                          # Next.js App Router pages
│   └── patients/[id]/           # Patient detail page
├── components/                   # Reusable UI components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   ├── patients/                # Patient-specific components
│   └── ui/                      # Base UI components (shadcn/ui)
├── hooks/                        # Custom React hooks
│   ├── use-patient-detail.ts    # Patient data management hook
│   └── use-patient-form.ts      # Patient form logic hook
├── services/                     # Business logic layer
│   ├── clinical.service.ts      # Clinical operations service
│   ├── patient.service.ts       # Patient operations service
│   └── facility.service.ts      # Facility operations service
├── types/                        # TypeScript type definitions
│   └── fhir.ts                  # FHIR resource types
├── lib/                          # Utility libraries
│   └── medplum.ts               # FHIR client configuration
└── utils/                        # Utility functions
    └── form-validation.ts       # Form validation helpers
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Pages**: Handle routing and layout only
- **Components**: Focus on presentation
- **Hooks**: Manage state and side effects
- **Services**: Contain business logic
- **Utils**: Provide pure helper functions

### 2. **Single Responsibility**
Each module has one clear purpose:
- `use-patient-detail.ts`: Fetch and manage patient data
- `clinical.service.ts`: Handle all clinical data operations
- `patient.service.ts`: Handle patient CRUD operations

### 3. **Dependency Inversion**
- Components depend on abstractions (hooks/services)
- Services depend on FHIR client interface
- No direct FHIR API calls in components

### 4. **Open/Closed Principle**
- Services are open for extension (add new methods)
- Closed for modification (existing methods stable)

### 5. **DRY (Don't Repeat Yourself)**
- Reusable hooks for common patterns
- Shared service methods
- Common UI components

## 🔧 Key Components

### Custom Hook: `use-patient-detail`

**Purpose**: Centralize patient data fetching and state management

**Features**:
- Automatic data loading on mount
- Error handling
- Loading states
- Refresh functionality
- Memoized callbacks

**Usage**:
```typescript
const {
  patient,
  encounters,
  problems,
  medications,
  allergies,
  observations,
  loading,
  refreshData
} = usePatientDetail(patientId);
```

**Benefits**:
- ✅ Single source of truth for patient data
- ✅ Consistent data fetching across components
- ✅ Easy to test
- ✅ Reusable across different views

### Service Layer: `ClinicalService`

**Purpose**: Encapsulate all clinical data operations

**Methods**:
1. `createVitals()` - Create vital signs observations
2. `createProblem()` - Create condition/problem
3. `createMedication()` - Create medication request
4. `createEncounter()` - Create patient encounter

**Benefits**:
- ✅ FHIR resource creation logic in one place
- ✅ Easy to add new clinical operations
- ✅ Consistent FHIR formatting
- ✅ Type-safe parameters
- ✅ Comprehensive JSDoc documentation

**Example**:
```typescript
await ClinicalService.createVitals(patientId, {
  bloodPressureSystolic: '120',
  bloodPressureDiastolic: '80',
  heartRate: '72',
  temperature: '37.0'
});
```

## 🔄 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service Method Call
    ↓
FHIR API (via medplum)
    ↓
Success/Error Response
    ↓
Hook Refresh
    ↓
Component Re-render
```

## 📊 State Management Strategy

### Local Component State
- UI state (drawer open/closed, form data)
- Temporary data before submission

### Custom Hook State
- Server data (patients, encounters, etc.)
- Loading/error states
- Data refresh triggers

### No Global State Needed
- Data fetched per page
- FHIR server is source of truth
- React Query could be added later for caching

## 🎨 Component Patterns

### 1. **Container/Presenter Pattern**
- Page components = Containers (logic)
- UI components = Presenters (display)

### 2. **Composition**
- Small, focused components
- Compose complex UIs from simple parts

### 3. **Controlled Components**
- Forms controlled via React state
- Single source of truth

## 🔐 Type Safety

### Strong Typing Throughout
```typescript
interface PatientDetails {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
}
```

### Service Method Signatures
```typescript
static async createProblem(
  patientId: string,
  patientName: string,
  problem: {
    condition: string;
    category: string;
    severity?: string;
    onsetDate: string;
  }
): Promise<void>
```

## 🧪 Testing Strategy

### Unit Tests
- Service methods (mock FHIR client)
- Utility functions
- Form validation

### Integration Tests
- Custom hooks (with React Testing Library)
- Component interactions

### E2E Tests
- Full patient workflow
- Data persistence

## 🚀 Extensibility Guide

### Adding a New Tab
1. Create tab component in `components/patients/tabs/`
2. Add tab config to page
3. Fetch required data in `use-patient-detail`
4. Create service methods if needed

### Adding New Clinical Data Type
1. Add method to `ClinicalService`
2. Add FHIR resource types to `types/fhir.ts`
3. Update `use-patient-detail` to fetch data
4. Create UI component

### Adding New Form
1. Create form component in `components/forms/`
2. Create custom hook for form logic
3. Add service method for submission
4. Integrate with drawer system

## 📈 Performance Considerations

### Current Optimizations
- `useCallback` for expensive functions
- `useMemo` for derived data
- Lazy loading of tabs (code splitting ready)
- Efficient FHIR queries with `_count` and `_sort`

### Future Optimizations
- React Query for caching
- Virtual scrolling for long lists
- Optimistic updates
- Background data refresh

## 🔍 Code Quality Standards

### ESLint Rules
- No unused variables
- Consistent imports
- Type safety enforced

### Naming Conventions
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Services: PascalCase with `Service` suffix
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### File Organization
- One component per file
- Co-locate related files
- Index files for clean imports

## 🛠️ Development Workflow

### Adding a Feature
1. Define types in `types/`
2. Create service method
3. Create/update hook
4. Build UI component
5. Integrate in page
6. Test thoroughly

### Refactoring Guide
1. Identify code smells
2. Extract to service/hook
3. Add types
4. Update tests
5. Document changes

## 📚 Best Practices

### DO
✅ Use TypeScript strictly
✅ Document complex logic
✅ Keep components small
✅ Use semantic HTML
✅ Handle errors gracefully
✅ Validate user input
✅ Follow SOLID principles
✅ Write self-documenting code

### DON'T
❌ Put business logic in components
❌ Make direct API calls from UI
❌ Use `any` type
❌ Repeat code
❌ Skip error handling
❌ Ignore accessibility
❌ Create god components

## 🔗 Integration Points

### FHIR Server
- Medplum client via `lib/medplum.ts`
- All FHIR operations through services
- Resource types defined in `types/fhir.ts`

### Authentication
- NextAuth.js integration
- Session management
- Protected routes

### UI Library
- shadcn/ui components
- Tailwind CSS styling
- Lucide icons

## 📖 Further Reading

- [FHIR R4 Specification](https://hl7.org/fhir/)
- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## 🎯 Success Metrics

The refactored code achieves:
- ✅ **Maintainability**: Clear structure, easy to navigate
- ✅ **Extensibility**: Simple to add new features
- ✅ **Testability**: Isolated logic, mockable dependencies
- ✅ **Reusability**: Shared hooks and services
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Documentation**: Comprehensive inline and external docs
- ✅ **Performance**: Optimized rendering and data fetching
- ✅ **Scalability**: Ready for growing codebase

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained by**: EHR Connect Team

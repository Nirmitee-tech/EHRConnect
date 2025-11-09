# Phase 2: Specialty-Aware Architecture

## Design Principles

1. **Separation of Concerns**: Each specialty has its own module/folder
2. **Composability**: Specialties extend base functionality, don't replace it
3. **Type Safety**: Full TypeScript support with strict types
4. **Performance**: Lazy loading, code splitting, memoization
5. **Maintainability**: Clear folder structure, consistent patterns
6. **Extensibility**: Easy to add new specialties without modifying core

---

## Folder Structure

```
ehr-web/src/
├── features/
│   ├── patient-detail/
│   │   ├── components/
│   │   │   ├── patient-sidebar.tsx (ENHANCED - specialty-aware)
│   │   │   └── ...
│   │   └── ...
│   │
│   └── specialties/                    # NEW - Specialty modules
│       ├── shared/                     # Shared specialty utilities
│       │   ├── types.ts
│       │   ├── constants.ts
│       │   ├── utils.ts
│       │   └── components/
│       │       ├── SpecialtyBadge.tsx
│       │       ├── EpisodeTimeline.tsx
│       │       └── SpecialtySwitcher.tsx
│       │
│       ├── general/                    # General primary care specialty
│       │   ├── index.ts
│       │   ├── config.ts               # Navigation, metadata
│       │   ├── components/
│       │   │   ├── GeneralDashboard.tsx
│       │   │   └── GeneralForms.tsx
│       │   └── hooks/
│       │       └── useGeneralSpecialty.ts
│       │
│       ├── ob-gyn/                     # OB/GYN specialty module
│       │   ├── index.ts
│       │   ├── config.ts
│       │   ├── components/
│       │   │   ├── PrenatalDashboard.tsx
│       │   │   ├── PrenatalFlowsheet.tsx
│       │   │   ├── LaborDeliveryWorkflow.tsx
│       │   │   └── PostpartumCare.tsx
│       │   ├── hooks/
│       │   │   ├── useObGynSpecialty.ts
│       │   │   └── usePrenatalData.ts
│       │   └── utils/
│       │       ├── eddCalculator.ts
│       │       └── prenatalValidation.ts
│       │
│       ├── orthopedics/                # Orthopedics specialty
│       │   ├── index.ts
│       │   ├── config.ts
│       │   ├── components/
│       │   │   ├── OrthopedicAssessment.tsx
│       │   │   ├── SurgeryWorkflow.tsx
│       │   │   └── RehabPlan.tsx
│       │   └── hooks/
│       │       └── useOrthopedicsSpecialty.ts
│       │
│       ├── wound-care/                 # Wound care specialty
│       │   ├── index.ts
│       │   ├── config.ts
│       │   ├── components/
│       │   │   ├── WoundAssessment.tsx
│       │   │   ├── WoundPhotography.tsx
│       │   │   └── HealingTracker.tsx
│       │   └── hooks/
│       │       └── useWoundCareSpecialty.ts
│       │
│       └── registry.ts                 # Specialty registry (frontend)
│
├── contexts/
│   ├── specialty-context.tsx           # ENHANCED
│   └── episode-context.tsx             # NEW - Patient episode context
│
└── types/
    ├── specialty.ts                    # ENHANCED
    └── episode.ts                      # NEW

ehr-api/
├── specialty-packs/
│   ├── general/1.0.0/
│   │   ├── pack.json                   # ENHANCED - add navigation
│   │   └── ...
│   │
│   ├── ob-gyn/1.0.0/                  # NEW
│   │   ├── pack.json
│   │   ├── navigation.json             # Sidebar navigation config
│   │   ├── visit-types.json
│   │   ├── templates/
│   │   │   ├── prenatal-intake.json
│   │   │   ├── prenatal-flowsheet.json
│   │   │   ├── labor-delivery.json
│   │   │   └── postpartum.json
│   │   └── reports/
│   │       └── prenatal-kpis.json
│   │
│   ├── orthopedics/1.0.0/             # NEW
│   │   └── ...
│   │
│   └── wound-care/1.0.0/              # NEW
│       └── ...
```

---

## Enhanced Pack Metadata Structure

### pack.json (Enhanced)

```json
{
  "slug": "ob-gyn",
  "version": "1.0.0",
  "name": "OB/GYN & Prenatal Care",
  "description": "Comprehensive obstetric and gynecological care",
  "category": "clinical",
  "icon": "Baby",
  "color": "#E91E63",
  "dependencies": ["general"],

  "navigation": {
    "sections": [
      {
        "id": "prenatal-overview",
        "label": "Prenatal Overview",
        "icon": "Activity",
        "category": "clinical",
        "order": 1
      },
      {
        "id": "prenatal-flowsheet",
        "label": "Prenatal Flowsheet",
        "icon": "ClipboardList",
        "category": "clinical",
        "order": 2
      },
      {
        "id": "ultrasounds",
        "label": "Ultrasounds",
        "icon": "ImageIcon",
        "category": "clinical",
        "order": 3
      },
      {
        "id": "labor-delivery",
        "label": "Labor & Delivery",
        "icon": "Heart",
        "category": "clinical",
        "order": 4
      },
      {
        "id": "postpartum",
        "label": "Postpartum Care",
        "icon": "Baby",
        "category": "clinical",
        "order": 5
      }
    ],
    "replaceSections": false,
    "mergeWith": "general"
  },

  "templates": ["templates/prenatal-intake.json", "..."],
  "visitTypes": "visit-types.json",
  "workflows": "workflows/prenatal.json",
  "reports": "reports/prenatal-kpis.json",

  "featureFlags": {
    "enableHighRiskPregnancy": true,
    "enableTTTSMonitoring": true,
    "enableFetalMonitoring": true
  },

  "episodeConfig": {
    "allowConcurrent": false,
    "defaultState": "active",
    "requiredFields": ["edd", "lmp", "gravida", "para"]
  }
}
```

---

## Implementation Strategy

### 1. Enhanced Sidebar with Specialty Filtering

#### Current Dropdown Options:
- All Sections
- Clinical
- Administrative
- Financial

#### Enhanced Dropdown Options:
- **All Sections** (shows everything)
- **General** (general primary care sections)
- **Clinical** (all clinical from all packs)
- **Administrative**
- **Financial**
- **--- Specialties ---** (divider)
- **OB/GYN** (only OB/GYN sections)
- **Orthopedics** (only orthopedic sections)
- **Wound Care** (only wound care sections)

### 2. Dynamic Navigation Loading

```typescript
// features/specialties/shared/hooks/useSpecialtyNavigation.ts
export function useSpecialtyNavigation(filter: SidebarView) {
  const { packs } = useSpecialtyContext();

  // Merge navigation from all enabled packs
  const navigation = useMemo(() => {
    const baseNavigation = getBaseNavigation(); // General sections

    if (filter === 'all') {
      // Merge all pack navigations
      return mergeNavigations(baseNavigation, ...packs.map(p => p.navigation));
    }

    if (filter === 'clinical' || filter === 'administrative' || filter === 'financial') {
      // Filter by category across all packs
      return filterNavigationByCategory(baseNavigation, packs, filter);
    }

    // Filter by specific specialty pack
    const pack = packs.find(p => p.slug === filter);
    if (pack?.navigation) {
      return pack.navigation.sections;
    }

    return baseNavigation;
  }, [packs, filter]);

  return navigation;
}
```

### 3. Episode Management System

```typescript
// contexts/episode-context.tsx
export function EpisodeProvider({ patientId, children }) {
  const [episodes, setEpisodes] = useState<PatientEpisode[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<PatientEpisode | null>(null);

  const createEpisode = async (specialtySlug: string, metadata: any) => {
    // API call to create episode
  };

  const updateEpisode = async (episodeId: string, updates: Partial<PatientEpisode>) => {
    // API call to update episode
  };

  const closeEpisode = async (episodeId: string, reason: string) => {
    // API call to close episode
  };

  return (
    <EpisodeContext.Provider value={{
      episodes,
      activeEpisode,
      setActiveEpisode,
      createEpisode,
      updateEpisode,
      closeEpisode,
      hasActiveEpisode: (slug: string) => episodes.some(e => e.specialty_slug === slug && e.active)
    }}>
      {children}
    </EpisodeContext.Provider>
  );
}
```

### 4. Specialty Module Pattern

Each specialty module exports a consistent interface:

```typescript
// features/specialties/ob-gyn/index.ts
export const ObGynSpecialty: SpecialtyModule = {
  slug: 'ob-gyn',
  name: 'OB/GYN',

  // Lazy-loaded components
  components: {
    Dashboard: lazy(() => import('./components/PrenatalDashboard')),
    Flowsheet: lazy(() => import('./components/PrenatalFlowsheet')),
    // ...
  },

  // Custom hooks
  hooks: {
    useSpecialtyData: () => import('./hooks/useObGynSpecialty'),
  },

  // Navigation configuration
  navigation: OBGYN_NAVIGATION,

  // Episode lifecycle handlers
  episodeHandlers: {
    onCreate: handleEpisodeCreate,
    onUpdate: handleEpisodeUpdate,
    onClose: handleEpisodeClose,
  }
};
```

### 5. Specialty Registry (Frontend)

```typescript
// features/specialties/registry.ts
class SpecialtyRegistry {
  private modules = new Map<string, SpecialtyModule>();

  register(module: SpecialtyModule) {
    this.modules.set(module.slug, module);
  }

  get(slug: string): SpecialtyModule | undefined {
    return this.modules.get(slug);
  }

  getComponent(slug: string, componentName: string): LazyExoticComponent<any> | undefined {
    return this.modules.get(slug)?.components[componentName];
  }
}

export const specialtyRegistry = new SpecialtyRegistry();

// Auto-register during app initialization
import { ObGynSpecialty } from './ob-gyn';
import { OrthopedicsSpecialty } from './orthopedics';
import { WoundCareSpecialty } from './wound-care';

specialtyRegistry.register(ObGynSpecialty);
specialtyRegistry.register(OrthopedicsSpecialty);
specialtyRegistry.register(WoundCareSpecialty);
```

### 6. Dynamic Component Rendering

```typescript
// features/patient-detail/components/PatientDetailContent.tsx
export function PatientDetailContent() {
  const activeTab = usePatientDetailStore(state => state.activeTab);
  const { activeEpisode } = useEpisodeContext();
  const { getPackBySlug } = useSpecialtyContext();

  // Determine which component to render
  const ComponentToRender = useMemo(() => {
    // Check if activeTab matches a specialty section
    if (activeEpisode) {
      const pack = getPackBySlug(activeEpisode.specialty_slug);
      const specialtyModule = specialtyRegistry.get(pack?.slug);

      // Find matching component in specialty module
      const component = specialtyModule?.components[activeTab];
      if (component) return component;
    }

    // Fall back to base components
    return getBaseComponent(activeTab);
  }, [activeTab, activeEpisode]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ComponentToRender />
    </Suspense>
  );
}
```

---

## API Enhancements

### New Episode Endpoints

```
POST   /api/patients/:patientId/episodes
GET    /api/patients/:patientId/episodes
GET    /api/patients/:patientId/episodes/:episodeId
PATCH  /api/patients/:patientId/episodes/:episodeId
DELETE /api/patients/:patientId/episodes/:episodeId
```

### Enhanced Pack Endpoints

```
GET /api/specialties/packs/:slug/navigation
GET /api/specialties/packs/:slug/components/:componentType
```

---

## Migration Path

### Phase 2.1: Foundation (Week 1)
- [ ] Enhance specialty types with navigation
- [ ] Create episode context and hooks
- [ ] Update pack.json structure for all packs
- [ ] Build episode management API endpoints

### Phase 2.2: Specialty Infrastructure (Week 2)
- [ ] Create specialty folder structure
- [ ] Build specialty registry
- [ ] Implement shared specialty components
- [ ] Create specialty module pattern/template

### Phase 2.3: Enhanced Sidebar (Week 2-3)
- [ ] Update sidebar to consume specialty navigation
- [ ] Add specialty filter to dropdown
- [ ] Implement dynamic section loading
- [ ] Add specialty badges/indicators

### Phase 2.4: First Specialty - OB/GYN (Week 3-4)
- [ ] Create OB/GYN specialty module
- [ ] Build prenatal components
- [ ] Implement episode management UI
- [ ] Create OB/GYN forms and templates

### Phase 2.5: Additional Specialties (Week 5-6)
- [ ] Implement Orthopedics module
- [ ] Implement Wound Care module
- [ ] Build specialty-specific dashboards
- [ ] Testing and refinement

---

## Quality Standards

### Code Quality
- **TypeScript Strict Mode**: All code must pass strict type checking
- **ESLint**: Zero warnings
- **Unit Tests**: 80%+ coverage for utilities and hooks
- **Integration Tests**: Cover all specialty workflows
- **Performance**: Lighthouse score 90+ on all specialty pages

### Documentation
- Each specialty module has a README.md
- JSDoc comments on all exported functions
- Storybook stories for all components
- API documentation for all endpoints

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader tested
- Focus management

---

## Benefits of This Architecture

1. **Modularity**: Each specialty is self-contained
2. **Scalability**: Easy to add new specialties
3. **Maintainability**: Clear separation of concerns
4. **Performance**: Lazy loading reduces initial bundle size
5. **Type Safety**: Full TypeScript coverage
6. **Testability**: Isolated modules are easier to test
7. **Reusability**: Shared components reduce duplication
8. **Flexibility**: Specialties can override or extend base functionality

---

## Next Steps

1. Review and approve architecture
2. Set up folder structure
3. Create specialty module template
4. Begin implementation with Phase 2.1

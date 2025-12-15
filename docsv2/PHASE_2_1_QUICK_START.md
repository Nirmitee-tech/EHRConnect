# Phase 2.1 Quick Start Guide

## 🚀 What You Can Do Now

### 1. Create an Episode for a Patient

```typescript
import { useEpisodeContext } from '@/contexts/episode-context';

function MyComponent() {
  const { createEpisode } = useEpisodeContext();

  const handleCreateEpisode = async () => {
    const episode = await createEpisode({
      patientId: 'patient-123',
      specialtySlug: 'general',
      status: 'active',
      metadata: {
        notes: 'Initial consultation'
      }
    });

    console.log('Created episode:', episode);
  };

  return <button onClick={handleCreateEpisode}>Start Episode</button>;
}
```

### 2. Check if Patient Has Active Episode

```typescript
import { useHasActiveEpisode } from '@/contexts/episode-context';

function SpecialtySection() {
  const hasObGynEpisode = useHasActiveEpisode('ob-gyn');

  if (!hasObGynEpisode) {
    return <StartEpisodeButton specialty="ob-gyn" />;
  }

  return <ObGynDashboard />;
}
```

### 3. Display Active Episodes

```typescript
import { useActiveEpisodes } from '@/contexts/episode-context';

function ActiveEpisodesList() {
  const activeEpisodes = useActiveEpisodes();

  return (
    <div>
      <h3>Active Specialties</h3>
      {activeEpisodes.map(episode => (
        <div key={episode.id}>
          <span>{episode.specialtySlug}</span>
          <span>{episode.status}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. Wrap Patient Pages with Episode Provider

```typescript
// app/patients/[id]/page.tsx
import { EpisodeProvider } from '@/contexts/episode-context';

export default function PatientPage({ params }: { params: { id: string } }) {
  return (
    <EpisodeProvider patientId={params.id} autoLoad={true}>
      <PatientDetailContent />
    </EpisodeProvider>
  );
}
```

---

## 🎯 Key Files to Know

### Frontend
```
ehr-web/src/
├── types/
│   ├── specialty.ts          # Enhanced specialty types
│   └── episode.ts             # FHIR episode types
│
├── services/
│   └── episode.service.ts     # Episode API client
│
└── contexts/
    └── episode-context.tsx    # Episode context & hooks
```

### Backend
```
ehr-api/src/
├── services/
│   └── episode.service.js     # Episode business logic
│
└── routes/
    └── episodes.js            # Episode API endpoints
```

### Pack Config
```
ehr-api/specialty-packs/general/1.0.0/
└── pack.json                  # Enhanced with navigation & episodeConfig
```

---

## 📋 Quick Testing

### Test Backend (Terminal 1)
```bash
cd ehr-api
npm run dev

# Test in another terminal
curl -X POST http://localhost:8000/api/patients/test-123/episodes \
  -H "Content-Type: application/json" \
  -H "x-org-id: YOUR_ORG_ID" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"specialtySlug":"general","status":"active"}'
```

### Test Frontend (Terminal 2)
```bash
cd ehr-web
npm run dev

# Open http://localhost:3000
# Wrap a patient page with EpisodeProvider
# Use the hooks in components
```

---

## 🔥 Pro Tips

1. **Always wrap patient pages with EpisodeProvider**
   ```typescript
   <EpisodeProvider patientId={patientId}>
     {/* Your components */}
   </EpisodeProvider>
   ```

2. **Use the specific hooks for better performance**
   ```typescript
   // ✅ Good - only re-renders when this specialty changes
   const hasEpisode = useHasActiveEpisode('ob-gyn');

   // ❌ Less optimal - re-renders on any episode change
   const { episodes } = useEpisodeContext();
   const hasEpisode = episodes.some(e => e.specialtySlug === 'ob-gyn');
   ```

3. **FHIR resources are optional**
   ```typescript
   // Don't need FHIR resource? Save bandwidth
   const episode = await getEpisodeById(session, patientId, episodeId, false);
   ```

4. **Check existing episodes before creating**
   ```typescript
   const { hasActiveEpisode, createEpisode } = useEpisodeContext();

   if (!hasActiveEpisode('ob-gyn')) {
     await createEpisode({ specialtySlug: 'ob-gyn', ... });
   }
   ```

---

## 🎨 Next: Enhance the Sidebar

In Phase 2.2, we'll update the sidebar to:
- Read navigation from specialty packs
- Filter by specialty
- Show episode indicators
- Dynamic section rendering

Stay tuned! 🚀

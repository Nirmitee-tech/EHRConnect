# Patient Portal V2 - Implementation Guide

## Overview
This guide provides instructions for implementing the new modern, mobile-first patient portal design with ORL branding and Synapse AI features.

## New Features

### 1. **ORL Branding** 🏥
- Modern medical logo with cyan/blue gradient
- Professional color scheme
- Clean, app-like interface

### 2. **Synapse AI Chat** 🤖
- ChatGPT-like health assistant
- Floating action button (FAB)
- Sliding chat panel
- Real-time health guidance

### 3. **Bottom Navigation** 📱
- Mobile-first design
- 4 primary navigation items
- Active state indicators
- Compact and accessible

### 4. **Wellness Tracker** 💪
- Visual vital signs cards
- Color-coded health metrics
- Trend indicators
- Quick health summary

### 5. **Modern Dashboard** ✨
- Gradient backgrounds
- Card-based layout
- Smooth animations
- Compact, scannable information

---

## File Structure

```
ehr-web/src/
├── components/
│   ├── branding/
│   │   └── orl-logo.tsx                    # NEW: ORL logo components
│   └── portal/
│       ├── patient-portal-layout.tsx       # OLD: Original layout
│       ├── patient-portal-layout-v2.tsx    # NEW: Mobile-first layout
│       └── synapse-ai-chat.tsx             # NEW: AI chat component
├── app/
│   ├── portal/
│   │   └── dashboard/
│   │       ├── page.tsx                    # OLD: Original dashboard
│   │       └── page-v2.tsx                 # NEW: Modern dashboard
│   └── globals.css                         # UPDATED: New color theme
```

---

## Implementation Steps

### Step 1: Switch to the New Layout

Open `/Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/portal/layout.tsx` and update the import:

**Before:**
```tsx
import PatientPortalLayout from '@/components/portal/patient-portal-layout'
```

**After:**
```tsx
import PatientPortalLayoutV2 from '@/components/portal/patient-portal-layout-v2'
```

**Then update the usage:**
```tsx
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PatientPortalLayoutV2>{children}</PatientPortalLayoutV2>
}
```

### Step 2: Switch to the New Dashboard

Rename the dashboard files to make V2 the default:

```bash
cd /Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/portal/dashboard

# Backup the old dashboard
mv page.tsx page-old.tsx

# Make V2 the default
mv page-v2.tsx page.tsx
```

### Step 3: Verify the Changes

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the patient portal at `http://localhost:3000/portal/dashboard`

3. You should see:
   - ORL logo in the header
   - Bottom navigation on mobile
   - Synapse AI floating button
   - Modern wellness tracker cards
   - Vibrant color scheme

---

## Component Usage

### Using the ORL Logo

```tsx
import { ORLLogo, ORLLogoMini } from '@/components/branding/orl-logo'

// Full logo with text
<ORLLogo size="md" showText={true} />

// Compact logo only
<ORLLogoMini />

// Sizes: 'sm' | 'md' | 'lg'
<ORLLogo size="lg" showText={true} />
```

### Using Synapse AI Chat

```tsx
import { SynapseAIChat, SynapseAIFAB } from '@/components/portal/synapse-ai-chat'

function MyComponent() {
  const [synapseOpen, setSynapseOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <SynapseAIFAB onClick={() => setSynapseOpen(true)} />

      {/* Chat Panel */}
      <SynapseAIChat
        isOpen={synapseOpen}
        onClose={() => setSynapseOpen(false)}
      />
    </>
  )
}
```

---

## Color Scheme

### Primary Colors
- **Primary (Cyan):** `#06B6D4` - Main brand color
- **Secondary (Slate):** `#F1F5F9` - Backgrounds
- **Accent (Purple):** `#8B5CF6` - AI features

### Gradient Classes

Use these CSS classes for modern gradients:

```tsx
// Cyan to Blue
<div className="gradient-cyan-blue">...</div>

// Purple to Pink
<div className="gradient-purple-pink">...</div>

// Teal to Emerald
<div className="gradient-teal-emerald">...</div>

// Orange to Amber
<div className="gradient-orange-amber">...</div>
```

### Wellness Card Colors

| Metric | Gradient | Icon |
|--------|----------|------|
| Heart Rate | Red to Pink | Heart |
| Blood Pressure | Blue to Cyan | Activity |
| Temperature | Orange to Amber | Thermometer |
| Oxygen Sat | Teal to Emerald | Wind |

---

## Responsive Design

### Breakpoints

- **Mobile:** `< 640px` (sm)
  - Bottom navigation visible
  - Single column layout
  - Compact cards

- **Tablet:** `640px - 1024px` (sm to lg)
  - Adaptive grid layouts
  - 2-column cards
  - Expanded information

- **Desktop:** `> 1024px` (lg)
  - Bottom navigation hidden
  - Multi-column layouts
  - Full feature set

### Mobile-First Classes

```tsx
// Hidden on mobile, visible on desktop
<div className="hidden sm:block">...</div>

// Visible on mobile, hidden on desktop
<div className="sm:hidden">...</div>

// Responsive grid
<div className="grid grid-cols-2 sm:grid-cols-4">...</div>
```

---

## Synapse AI Integration

### Current Implementation
The Synapse AI currently uses mock responses. To integrate with a real AI backend:

1. **Update the API endpoint** in `synapse-ai-chat.tsx`:

```tsx
const handleSend = async () => {
  // Replace this section
  const response = await fetch('/api/patient/synapse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage.content,
      patientId: session?.patientId,
      context: dashboardData, // Optional: Include health context
    }),
  })

  const data = await response.json()
  const aiMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: data.response,
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, aiMessage])
}
```

2. **Create the API route** at `/api/patient/synapse/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.patientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, patientId, context } = await request.json()

  // TODO: Integrate with your AI service (OpenAI, Anthropic, etc.)
  // const response = await openai.chat.completions.create({...})

  return NextResponse.json({
    response: 'AI response here',
    timestamp: new Date().toISOString(),
  })
}
```

### Suggested AI Prompts

Use these system prompts to configure your AI:

```
You are Synapse, a helpful AI health assistant for ORL Healthcare's patient portal.

Guidelines:
- Be empathetic and professional
- Provide accurate health information
- Encourage patients to consult their healthcare provider for medical advice
- Help patients navigate their portal features
- Explain medical records in simple terms
- Never provide diagnoses or treatment plans

Context available:
- Patient appointments
- Medications
- Vital signs
- Allergies
- Conditions
- Recent lab results
```

---

## Animation Classes

### Available Animations

```css
/* Fade in from bottom */
.animate-fadeInUp

/* Slide in from left */
.animate-slideInLeft

/* Slide in from right */
.animate-slideInRight

/* Scale in */
.animate-scaleIn

/* Pulse effect */
.animate-pulse

/* Bounce effect */
.animate-bounce-subtle

/* Float effect (for FAB) */
.animate-float

/* Slide in from bottom (nav) */
.animate-slideInBottom
```

### Usage Example

```tsx
<Card className="animate-fadeInUp hover:shadow-xl transition-all">
  <CardContent>...</CardContent>
</Card>
```

---

## Bottom Navigation Configuration

### Adding/Removing Items

Edit `patient-portal-layout-v2.tsx`:

```tsx
const bottomNavItems = [
  { name: 'Home', href: '/portal/dashboard', icon: Home },
  { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'Records', href: '/portal/health-records', icon: FileText },
  { name: 'Messages', href: '/portal/messages', icon: MessageSquare, badge: 3 },
  // Add more items here (max 5 recommended)
]
```

### Badge Configuration

To update the badge count dynamically:

```tsx
const [unreadMessages, setUnreadMessages] = useState(0)

// Fetch from API
useEffect(() => {
  fetch('/api/patient/messages/unread-count')
    .then(res => res.json())
    .then(data => setUnreadMessages(data.count))
}, [])

const bottomNavItems = [
  // ...
  {
    name: 'Messages',
    href: '/portal/messages',
    icon: MessageSquare,
    badge: unreadMessages > 0 ? unreadMessages : undefined
  },
]
```

---

## Testing Checklist

### Mobile (< 640px)
- [ ] Bottom navigation visible and functional
- [ ] Synapse AI FAB positioned correctly
- [ ] Cards stack in single column
- [ ] Text is readable without zoom
- [ ] Touch targets are at least 44x44px

### Tablet (640px - 1024px)
- [ ] Responsive grid layouts work
- [ ] Navigation adapts correctly
- [ ] Cards display in 2 columns
- [ ] All features accessible

### Desktop (> 1024px)
- [ ] Bottom navigation hidden
- [ ] Full multi-column layout
- [ ] Synapse AI chat panel works
- [ ] Hover states functional

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Safari (iOS + macOS)
- [ ] Firefox
- [ ] Mobile browsers

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

---

## Customization Tips

### Changing Brand Colors

Edit `globals.css`:

```css
:root {
  /* Change primary color from cyan to your brand color */
  --primary: #YOUR_COLOR_HERE;

  /* Update gradients */
  --gradient-cyan-blue: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Adjusting Wellness Cards

In `page-v2.tsx`, customize the wellness tracker:

```tsx
// Add new metrics
<Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50">
  <CardContent className="p-4">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
      <YourIcon className="w-5 h-5 text-white" />
    </div>
    <p className="text-xs text-gray-600 font-medium">Sleep Quality</p>
    <p className="text-2xl font-bold text-gray-900">
      {sleepData}
      <span className="text-sm text-gray-500 ml-1">hrs</span>
    </p>
  </CardContent>
</Card>
```

### Customizing Synapse AI Appearance

Edit `synapse-ai-chat.tsx`:

```tsx
{/* Change header gradient */}
<div className="bg-gradient-to-r from-YOUR_COLOR1 via-YOUR_COLOR2 to-YOUR_COLOR3">
  {/* Change icon */}
  <YourCustomIcon className="w-6 h-6 text-white" />
  {/* Change title */}
  <h2 className="text-lg font-bold text-white">Your AI Name</h2>
</div>
```

---

## Troubleshooting

### Issue: Bottom navigation not showing

**Solution:** Check screen size. It's hidden on screens wider than 640px (sm breakpoint).

```tsx
{/* Force show for testing */}
<nav className="fixed bottom-0 left-0 right-0 z-40">
  {/* Remove sm:hidden temporarily */}
```

### Issue: Synapse AI FAB overlaps content

**Solution:** Adjust positioning in `synapse-ai-chat.tsx`:

```tsx
// Change z-index or position
<button className="fixed bottom-24 right-6 z-30">
```

### Issue: Colors not updating

**Solution:** Clear Next.js cache and rebuild:

```bash
rm -rf .next
npm run dev
```

### Issue: TypeScript errors

**Solution:** Ensure all dependencies are installed:

```bash
npm install lucide-react date-fns
npm install -D @types/node
```

---

## Migration Checklist

When moving from old to new design:

- [x] Create new components (orl-logo, synapse-ai-chat, layout-v2, dashboard-v2)
- [x] Update color scheme in globals.css
- [x] Add new animation classes
- [ ] Switch layout import in portal/layout.tsx
- [ ] Rename dashboard files (page.tsx → page-old.tsx, page-v2.tsx → page.tsx)
- [ ] Test on mobile devices
- [ ] Test Synapse AI functionality
- [ ] Update other portal pages to match new design
- [ ] Configure AI backend integration
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Deploy to production

---

## Next Steps

1. **Test the new design**
   - Open the portal in your browser
   - Try on mobile device or responsive mode
   - Click the Synapse AI button
   - Navigate using bottom navigation

2. **Customize branding**
   - Replace ORL with your organization name
   - Adjust colors to match brand guidelines
   - Update logo design if needed

3. **Integrate AI backend**
   - Set up AI API endpoint
   - Configure system prompts
   - Add error handling
   - Implement rate limiting

4. **Enhance features**
   - Add more wellness metrics
   - Implement real-time vitals
   - Add health goals tracking
   - Create personalized insights

---

## Support

For questions or issues:
- Review this guide
- Check the component files for inline comments
- Test on multiple devices
- Consult the Next.js and Tailwind documentation

---

**Version:** 2.0
**Last Updated:** 2025-11-02
**Author:** Claude Code
**License:** Internal Use Only

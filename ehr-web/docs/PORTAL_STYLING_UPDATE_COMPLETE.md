# Patient Portal - Complete Styling Update Guide

## Color Theme: #1B2156 (Navy Blue)

All portal pages have been updated with the following consistent styling:

### Global Design Principles

1. **Color Scheme**
   - Primary: #1B2156 (Navy)
   - Background: White (#FFFFFF)
   - Text: Gray-900 on white, White on navy
   - Borders: Gray-200
   - Shadows: Subtle sm/md only

2. **Spacing (More Compact)**
   - Page spacing: `space-y-4` (16px)
   - Card padding: `p-4` (16px)
   - Section padding: `p-3` to `p-4`
   - Header height: 56px (h-14)
   - Button height: 36px (h-9) for default

3. **Typography**
   - Page titles: `text-2xl font-bold` (down from text-3xl)
   - Section titles: `text-base font-bold`
   - Body text: `text-sm`
   - Small text: `text-xs`

4. **Components**
   - Cards: White background, gray-200 border, sm shadow
   - Buttons (Primary): #1B2156 background, white text
   - Buttons (Secondary): Gray-100 border, outline style
   - Icons: Smaller (w-4 h-4 instead of w-5 h-5)

---

## ✅ Updated Pages

### 1. Dashboard (`/portal/dashboard`)
- **Status**: ✅ Complete
- Navy welcome banner with #1B2156
- White wellness cards with compact spacing
- Smaller quick action cards
- All text properly visible

### 2. Layout (`patient-portal-layout.tsx`)
- **Status**: ✅ Complete
- Header: #1B2156 background
- White text on navy header
- Bottom nav: #1B2156 for active state
- Desktop sidebar: #1B2156 for active items
- Mobile scrolling fixed

### 3. Synapse AI (`synapse-ai-chat-v2.tsx`)
- **Status**: ✅ Complete
- Header: #1B2156
- FAB: #1B2156
- White background for messages
- Compact sizing

### 4. Appointments (`/portal/appointments`)
- **Status**: ✅ Complete
- Compact header with #1B2156 button
- White cards with gray borders
- Smaller text and icons
- 3px left border accent in #1B2156

---

## 🔄 Pages Requiring Updates

Apply these patterns to all remaining portal pages:

### Template for Each Page

```tsx
// Page Structure
<div className="space-y-4 max-w-7xl mx-auto">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">[Page Title]</h1>
      <p className="text-sm text-gray-600 mt-0.5">[Description]</p>
    </div>
    <Button
      className="w-full sm:w-auto text-white"
      style={{ backgroundColor: '#1B2156' }}
    >
      [Action Button]
    </Button>
  </div>

  {/* Content Cards */}
  <Card className="border border-gray-200 shadow-sm bg-white">
    <CardContent className="p-4">
      {/* Card content */}
    </CardContent>
  </Card>
</div>
```

### Specific Updates Needed

#### 5. Health Records (`/portal/health-records`)
```tsx
// Header
<h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
<p className="text-sm text-gray-600 mt-0.5">View and manage your medical information</p>

// Summary Cards - More compact
<Card className="border border-gray-200 shadow-sm bg-white"
      style={{ borderLeftWidth: '3px', borderLeftColor: '#1B2156' }}>
  <CardContent className="p-4">
    {/* Reduce icon sizes to w-10 h-10 */}
    {/* Reduce text to text-xl font-bold */}
  </CardContent>
</Card>

// Tabs
<TabsList className="bg-gray-100">
  <TabsTrigger
    className="data-[state=active]:text-white"
    style={{ backgroundColor: isActive ? '#1B2156' : 'transparent' }}
  >
    [Tab Name]
  </TabsTrigger>
</TabsList>

// List items - More compact
<div className="p-3 border border-gray-200 rounded-lg">
  {/* Reduce padding and font sizes */}
</div>
```

#### 6. Messages (`/portal/messages`)
```tsx
// Apply same patterns:
- text-2xl for title
- p-4 for card padding
- #1B2156 for primary buttons
- White backgrounds
- Gray-200 borders
```

#### 7. Documents (`/portal/documents`)
```tsx
// Document cards
<Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all">
  <CardContent className="p-4">
    {/* Icon: w-10 h-10 */}
    {/* Title: text-base font-bold */}
    {/* Subtitle: text-sm */}
  </CardContent>
</Card>

// Download button
<Button
  size="sm"
  className="text-white"
  style={{ backgroundColor: '#1B2156' }}
>
  <Download className="w-4 h-4 mr-1.5" />
  Download
</Button>
```

#### 8. Billing (`/portal/billing`)
```tsx
// Amount cards
<Card className="border border-gray-200 shadow-sm bg-white">
  <CardContent className="p-4">
    <p className="text-xs text-gray-600">Balance Due</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">$XXX.XX</p>
  </CardContent>
</Card>

// Pay button
<Button
  className="text-white"
  style={{ backgroundColor: '#1B2156' }}
>
  <CreditCard className="w-4 h-4 mr-1.5" />
  Pay Now
</Button>
```

#### 9. Forms (`/portal/forms`)
```tsx
// Form list items
<Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
           style={{ backgroundColor: '#1B2156' }}>
        <FileText className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900">[Form Name]</h3>
        <p className="text-xs text-gray-600">[Description]</p>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 10. Family Access (`/portal/family`)
```tsx
// Family member cards
<Card className="border border-gray-200 shadow-sm bg-white">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 ring-2"
              style={{ ringColor: '#1B2156' }}>
        {/* Avatar content */}
      </Avatar>
      <div>
        <h3 className="text-sm font-bold">[Name]</h3>
        <p className="text-xs text-gray-600">[Relationship]</p>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 11. Telehealth (`/portal/telehealth`)
```tsx
// Join call button
<Button
  size="lg"
  className="text-white w-full"
  style={{ backgroundColor: '#1B2156' }}
>
  <Video className="w-5 h-5 mr-2" />
  Join Video Call
</Button>
```

---

## Component Style Reference

### Buttons

```tsx
// Primary Button
<Button
  className="text-white"
  style={{ backgroundColor: '#1B2156' }}
  size="sm"  // or default
>
  <Icon className="w-4 h-4 mr-1.5" />
  Button Text
</Button>

// Secondary/Outline Button
<Button
  variant="outline"
  size="sm"
  className="border-gray-300 hover:bg-gray-50"
>
  Button Text
</Button>
```

### Cards

```tsx
// Standard Card
<Card className="border border-gray-200 shadow-sm bg-white">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>

// Card with Left Accent
<Card
  className="border border-gray-200 shadow-sm bg-white"
  style={{ borderLeftWidth: '3px', borderLeftColor: '#1B2156' }}
>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>

// Hoverable Card
<Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Tabs

```tsx
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="bg-gray-100">
    <TabsTrigger
      value="tab1"
      className="data-[state=active]:text-white"
      // Active state gets #1B2156 background automatically
    >
      Tab 1
    </TabsTrigger>
  </TabsList>
  <TabsContent value="tab1" className="mt-4 space-y-3">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### Status Badges

```tsx
// Success
<Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>

// Warning
<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>

// Error
<Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>

// Info (use navy)
<Badge className="text-white" style={{ backgroundColor: '#1B2156' }}>Booked</Badge>
```

### Icons

```tsx
// Standard size in lists/cards
<Icon className="w-4 h-4" />

// In icon boxes
<div className="w-10 h-10 rounded-lg flex items-center justify-center"
     style={{ backgroundColor: '#1B2156' }}>
  <Icon className="w-5 h-5 text-white" />
</div>

// Large display icons
<Icon className="w-12 h-12 text-gray-300" />
```

### Empty States

```tsx
<div className="text-center py-10">
  <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
  <h3 className="text-base font-bold text-gray-900 mb-1.5">No Items</h3>
  <p className="text-sm text-gray-600 mb-4">Description text</p>
  <Button className="text-white" style={{ backgroundColor: '#1B2156' }}>
    Add Item
  </Button>
</div>
```

---

## Quick Reference - Before/After

### Before (Old Style)
```tsx
// Old style - DON'T USE
<h1 className="text-3xl font-bold">Title</h1>
<Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
  <CardContent className="p-6">
    <Button className="bg-blue-600 hover:bg-blue-700">Action</Button>
  </CardContent>
</Card>
```

### After (New Style)
```tsx
// New style - USE THIS
<h1 className="text-2xl font-bold text-gray-900">Title</h1>
<Card className="border border-gray-200 shadow-sm bg-white">
  <CardContent className="p-4">
    <Button className="text-white" style={{ backgroundColor: '#1B2156' }}>
      Action
    </Button>
  </CardContent>
</Card>
```

---

## Testing Checklist

For each page, verify:

- [ ] Header uses text-2xl (not text-3xl)
- [ ] Primary buttons use #1B2156 background
- [ ] All cards have white background
- [ ] All cards have gray-200 border
- [ ] Padding is p-4 or less
- [ ] Icons are w-4 h-4 in buttons/lists
- [ ] Text is visible (proper contrast)
- [ ] Mobile view scrolls properly
- [ ] Bottom nav doesn't block content
- [ ] Spacing is compact (space-y-4)

---

## Implementation Priority

1. ✅ Layout & Navigation (DONE)
2. ✅ Dashboard (DONE)
3. ✅ Appointments (DONE)
4. 🔄 Health Records (IN PROGRESS)
5. ⏳ Messages
6. ⏳ Documents
7. ⏳ Billing
8. ⏳ Forms
9. ⏳ Family Access
10. ⏳ Telehealth
11. ⏳ Profile/Settings

---

## Notes

- **Always use inline styles for #1B2156**: `style={{ backgroundColor: '#1B2156' }}`
- **Never use gradients**: Solid colors only
- **Border-left accents**: 3px width, #1B2156 color
- **Consistent spacing**: Use Tailwind's spacing scale
- **Mobile-first**: Test on small screens first
- **Accessibility**: Maintain proper color contrast ratios

---

## Support

If a component doesn't match this guide, update it to follow these patterns. The goal is consistency across all portal pages with the professional navy theme and clean white design.

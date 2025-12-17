# How to Use the New Visual Form Builder

## 🎯 Quick Start

### 1. **Enable Multi-Step Mode**
- Open the form builder page
- Toggle the **"Multi-Step"** switch in the top toolbar
- The new visual builder will appear!

### 2. **Create Your First Step**
- Click the **"Add Step"** button in the center area
- A new step card appears and is automatically selected
- The right panel shows configuration options

### 3. **Configure Each Step**
Three ways to configure a step:

#### Option A: Click the whole step card
- Click anywhere on the step card
- The right panel updates with that step's settings

#### Option B: Click the Settings icon
- Click the ⚙️ icon on the step card
- Opens configuration in the right panel

#### Option C: Click empty field area
- If step has no fields, click the dashed box
- Opens configuration panel

### 4. **Add Fields to Steps**
Two ways to add fields:

#### Drag from Component Palette (LEFT PANEL)
1. Find the component you need (Text, Number, Date, etc.)
2. Click and drag it onto a step card
3. Drop it on the step
4. Field is automatically added!

#### Configure in Right Panel
1. Select a step
2. Scroll down to "Form Fields" section
3. Fields will appear here as you add them

### 5. **Reorder Steps**
- Drag the **≡ handle** on any step card
- Move it left or right
- Drop to reorder steps

### 6. **Reorder Fields Within Step**
- Expand a step card (if collapsed)
- Drag the **≡ handle** on any field
- Move it up or down
- Drop to reorder fields

### 7. **Move Fields Between Steps**
- Drag a field from one step
- Drop it on another step
- Field moves to the new step!

## 📋 Available Field Types

| Type | Description | Icon |
|------|-------------|------|
| Short Text | Single line text input | Aa |
| Long Text | Multi-line text area | ≡ |
| Number | Whole number input | # |
| Decimal | Decimal number input | # |
| Date | Date picker | 📅 |
| Date & Time | Date and time picker | 📅 |
| Yes/No | Boolean toggle | ⚡ |
| Multiple Choice | Radio buttons/dropdown | ⭕ |
| Choice + Text | Choice with "Other" option | ⭕ |
| Display Text | Read-only information | 📄 |

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Toolbar: Multi-Step Toggle, Save, etc.                 │
├──────────┬──────────────────────────────┬──────────────────┤
│ COMPONENT│   HORIZONTAL STEP SWIMLANE   │  STEP CONFIG     │
│ PALETTE  │                              │  PANEL           │
│          │  [Step 1] [Step 2] [Step 3] │                  │
│ • Text   │                              │  ┌─Step 1───────┐│
│ • Number │  Click step to configure →  │  │ Title:       ││
│ • Date   │  Drag to reorder steps       │  │ Description: ││
│ • Choice │                              │  │              ││
│ ...      │  Fields shown in each card:  │  │ Navigation   ││
│          │  ┌──────────────┐            │  │ Validation   ││
│ [Drag    │  │ ≡ Field 1    │            │  │ Rules        ││
│  onto    │  │ ≡ Field 2    │            │  │              ││
│  steps]  │  └──────────────┘            │  └──────────────┘│
└──────────┴──────────────────────────────┴──────────────────┘
```

## ⚙️ Step Configuration Options

When you click on a step, the right panel shows:

### 1. **Step Information**
- Title (e.g., "Personal Information")
- Description (optional instructions)

### 2. **Navigation Settings**
- ☑️ Allow Back Navigation
- ☑️ Allow Skip Step

### 3. **Validation Settings**
- ☑️ Validate on Next

### 4. **Step Validation Rules** (Phase 04)
- Create advanced validation rules
- Set visibility conditions
- Define custom actions
- Test rules with mock data

### 5. **Form Fields**
- Shows all fields in this step
- Field count display

## 💡 Tips & Tricks

### Visual Feedback
- **Selected Step**: Blue border + shadow + ring
- **Hover Step**: Blue border (lighter)
- **Dragging**: Item becomes semi-transparent
- **Empty Step**: Shows helpful dashed box

### Keyboard-Friendly
- Tab through buttons
- Enter to click
- All interactive elements accessible

### Auto-Select
- When you create a new step, it's automatically selected
- Ready to configure immediately!

### Toggle Panels
- Hide/Show Components (left)
- Hide/Show Editor (right)
- Get more space when needed

## 🔄 Workflow Example

1. Click **"Multi-Step"** toggle
2. Click **"Add Step"** → Step 1 created
3. Change title to "Personal Info"
4. Drag **"Short Text"** from palette → drop on Step 1
5. Field appears in step card
6. Click **"Add Step"** → Step 2 created
7. Change title to "Medical History"
8. Drag **"Long Text"** → drop on Step 2
9. Drag steps to reorder if needed
10. Click **Save** to persist

## 📦 What Changed from Old UI?

| Old UI | New UI |
|--------|--------|
| Vertical step list (sidebar) | Horizontal step cards |
| Click to navigate steps | Click to configure |
| Preview in separate panel | Integrated field view |
| Add fields via editor | Drag & drop from palette |
| Manual field ordering | Drag to reorder |

## ✅ Benefits

- **See All Steps** - Horizontal layout shows overview
- **Visual Drag & Drop** - Intuitive field management
- **Better Space** - More room for configuration
- **Faster Workflow** - Less clicking, more dragging
- **Touch Friendly** - Works on tablets
- **Phase 04 Integration** - All rule builder features preserved!

## 🆘 Troubleshooting

**Q: I don't see the new UI**
- A: Make sure "Multi-Step" toggle is ON

**Q: Can't drag components**
- A: Click and hold, then drag (8px movement threshold)

**Q: Where's the rule builder?**
- A: Select a step → scroll to "Step Validation Rules" section

**Q: How do I add fields without dragging?**
- A: For now, drag is the primary method. Manual field adding coming soon!

**Q: Can I revert to old UI?**
- A: Yes! All old code backed up in `backup-before-visual-builder/`

---

**Enjoy the new visual builder! 🎨**

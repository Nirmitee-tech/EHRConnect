# EHR Connect Design System - Setup Guide

Complete guide for setting up and using the EHR Connect Design System in your projects.

## 🚀 Installation

### Step 1: Install the Package

```bash
cd ehr-design-system
npm install
```

### Step 2: Build the Design System

```bash
npm run build
```

This will generate:
- `dist/index.js` - CommonJS bundle
- `dist/index.esm.js` - ES Module bundle
- `dist/index.css` - Compiled styles
- `dist/*.d.ts` - TypeScript definitions

### Step 3: Link Locally (For Development)

```bash
cd ehr-design-system
npm link
```

Then in your project:

```bash
cd your-project
npm link @nirmitee.io/design-system
```

## 📝 Usage in Projects

### In EHR-Web (Next.js)

1. **Install or link the package:**

```bash
npm link @nirmitee.io/design-system
```

2. **Import styles in your layout:**

```tsx
// app/layout.tsx
import "@nirmitee.io/design-system/dist/index.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

3. **Use components:**

```tsx
// app/patients/page.tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "@nirmitee.io/design-system";

export default function PatientsPage() {
  return (
    <div>
      <Button variant="medical">Add Patient</Button>
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### In Other React Projects

1. **Install the package:**

```bash
npm install @nirmitee.io/design-system
```

2. **Import styles in your entry point:**

```tsx
// index.tsx or App.tsx
import "@nirmitee.io/design-system/dist/index.css";
```

3. **Use components as needed**

## 🎨 Customization

### Extending Tailwind Config

```js
// tailwind.config.js
module.exports = {
  presets: [
    require('@nirmitee.io/design-system/tailwind.config.js')
  ],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nirmitee.io/design-system/dist/**/*.js',
  ],
  // Your custom configuration
}
```

### Custom CSS Variables

Override design tokens in your global CSS:

```css
:root {
  --primary: 240 58% 51%;  /* Custom primary color */
  --radius: 0.75rem;        /* Custom border radius */
}
```

## 📚 Development Workflow

### Running Storybook

```bash
cd ehr-design-system
npm run dev
```

Open http://localhost:6006 to view all components.

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 🔧 Troubleshooting

### TypeScript Errors

If you see TypeScript errors after installation, ensure you have these in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

### Styles Not Loading

Make sure you've imported the CSS file:

```tsx
import "@nirmitee.io/design-system/dist/index.css";
```

### Components Not Found

Verify the package is properly installed:

```bash
npm list @nirmitee.io/design-system
```

## 📦 Publishing

To publish to npm:

```bash
npm run build
npm publish
```

## 🎯 Best Practices

1. **Always import styles first** before using components
2. **Use semantic variants** (medical, success, danger) for healthcare context
3. **Leverage design tokens** for consistent spacing and colors
4. **Follow atomic design** patterns when extending components
5. **Add proper TypeScript types** to your implementations

## 🔗 Integration Examples

### With Existing Shadcn Components

```tsx
import { Button } from "@nirmitee.io/design-system";
import { Dialog } from "@/components/ui/dialog"; // Your existing shadcn

function MyComponent() {
  return (
    <Dialog>
      <Button variant="medical">Open Dialog</Button>
    </Dialog>
  );
}
```

### With Ant Design

```tsx
import { Button, Card } from "@nirmitee.io/design-system";
import { Table } from "antd";

function PatientList() {
  return (
    <Card>
      <Button variant="medical">Add Patient</Button>
      <Table dataSource={data} />
    </Card>
  );
}
```

## 📖 Further Reading

- [Main README](./README.md) - Package overview
- [Storybook](http://localhost:6006) - Component documentation
- [Tailwind Config](./tailwind.config.js) - Design tokens

---

Need help? Check the main repository issues or contact the EHR Connect team.

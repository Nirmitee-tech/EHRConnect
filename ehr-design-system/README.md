# @ehrconnect/design-system

A comprehensive, healthcare-focused design system for EHR Connect applications. Built with React, TypeScript, Tailwind CSS, shadcn/ui components, and Ant Design integration.

## 🎨 Features

- **Atomic Design Structure**: Organized components following atomic design principles
- **Healthcare-Optimized**: Custom medical color schemes and healthcare-specific components
- **TypeScript First**: Full type safety across all components
- **Storybook Documentation**: Interactive component documentation and testing
- **Tailwind CSS**: Utility-first styling with custom healthcare themes
- **shadcn/ui Integration**: Built on top of Radix UI primitives
- **Ant Design Support**: Compatible with Ant Design components
- **Accessible**: WCAG 2.1 compliant components
- **Clean Code**: Following SOLID principles and best practices
- **Tree-shakeable**: Optimized bundle size with ES modules

## 📦 Installation

```bash
npm install @ehrconnect/design-system

# or with yarn
yarn add @ehrconnect/design-system

# or with pnpm
pnpm add @ehrconnect/design-system
```

### Peer Dependencies

Ensure you have these installed:

```bash
npm install react react-dom
```

## 🚀 Quick Start

### 1. Import Styles

Add the styles to your application entry point:

```tsx
import "@ehrconnect/design-system/dist/index.css";
```

### 2. Configure Tailwind (Optional but Recommended)

If you're using Tailwind CSS in your project, extend your `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@ehrconnect/design-system/dist/**/*.js",
  ],
  // ... rest of your config
};
```

### 3. Use Components

```tsx
import { Button, Card, Input, Badge } from "@ehrconnect/design-system";

function App() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Patient Information</Card.Title>
        <Card.Description>Enter patient details below</Card.Description>
      </Card.Header>
      <Card.Content>
        <Input 
          label="Patient Name" 
          placeholder="John Doe" 
        />
        <Badge variant="medical">Active Patient</Badge>
      </Card.Content>
      <Card.Footer>
        <Button variant="medical">Save Patient</Button>
      </Card.Footer>
    </Card>
  );
}
```

## 🎭 Component Library

### Atoms

#### Button

Versatile button component with multiple variants optimized for healthcare workflows.

```tsx
import { Button } from "@ehrconnect/design-system";

// Variants
<Button variant="default">Default</Button>
<Button variant="medical">Medical Action</Button>
<Button variant="success">Approve</Button>
<Button variant="danger">Critical</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Information</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// With Icons
<Button variant="medical">
  <HeartIcon className="mr-2" />
  Patient Care
</Button>
```

#### Input

Form input component with label, error handling, and icon support.

```tsx
import { Input } from "@ehrconnect/design-system";
import { User } from "lucide-react";

<Input 
  label="Patient ID"
  placeholder="Enter patient ID"
  icon={<User />}
  error="Patient ID is required"
/>
```

#### Card

Container component for grouping related content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ehrconnect/design-system";

<Card>
  <CardHeader>
    <CardTitle>Medical Record</CardTitle>
    <CardDescription>Patient medical history</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Badge

Small status indicators and labels.

```tsx
import { Badge } from "@ehrconnect/design-system";

<Badge variant="medical">Critical</Badge>
<Badge variant="success">Stable</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Emergency</Badge>
<Badge variant="info">Information</Badge>
```

## 🎨 Design Tokens

### Colors

The design system includes healthcare-optimized color palettes:

```css
--primary: #667eea (Medical Purple)
--secondary: #764ba2 (Deep Purple)
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--danger: #ef4444 (Red)
--info: #3b82f6 (Blue)
```

### Typography

Based on Inter font family with these scales:

- **Display**: 2rem - 4rem
- **Heading**: 1.5rem - 2rem
- **Body**: 0.875rem - 1rem
- **Caption**: 0.75rem - 0.875rem

### Spacing

Consistent spacing scale based on 0.25rem (4px) increments.

## 🛠️ Development

### Setup

```bash
# Clone the repository
cd ehr-design-system

# Install dependencies
npm install

# Start Storybook
npm run dev

# Build the package
npm run build

# Run tests
npm test
```

### Project Structure

```
ehr-design-system/
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic building blocks
│   │   ├── molecules/      # Composite components
│   │   └── organisms/      # Complex components
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── styles/
│   │   └── globals.css     # Global styles & tokens
│   └── index.ts            # Main export file
├── .storybook/             # Storybook configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── rollup.config.js
```

## 📚 Storybook

View all components in Storybook:

```bash
npm run dev
```

Then open http://localhost:6006

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test --  --watch

# Generate coverage
npm test -- --coverage
```

## 📝 Contributing

We follow clean code principles and SOLID design patterns. When contributing:

1. Write complete, testable code
2. Follow atomic design principles
3. Add Storybook stories for new components
4. Include TypeScript types
5. Write unit tests
6. Update documentation

## 🔗 Integration with Existing Projects

### With Next.js

```tsx
// app/layout.tsx
import "@ehrconnect/design-system/dist/index.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### With Ant Design

The design system works alongside Ant Design:

```tsx
import { Button } from "@ehrconnect/design-system";
import { Table } from "antd";

function PatientList() {
  return (
    <div>
      <Button variant="medical">Add Patient</Button>
      <Table dataSource={patients} columns={columns} />
    </div>
  );
}
```

## 🎯 Use Cases

Perfect for:

- 🏥 Electronic Health Record (EHR) systems
- 👨‍⚕️ Healthcare provider portals
- 🏥 Hospital management systems
- 📊 Medical data visualization
- 💊 Pharmacy management systems
- 🩺 Telemedicine platforms

## 📄 License

MIT © EHR Connect

## 🤝 Support

For issues and feature requests, please use the GitHub issues page.

---

Built with ❤️ for healthcare professionals

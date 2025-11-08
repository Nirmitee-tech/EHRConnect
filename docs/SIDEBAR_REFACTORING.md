# Sidebar Component Refactoring

## Overview

The admin sidebar component has been successfully extracted into the EHR Design System. This refactoring separates UI concerns from business logic, making the components reusable across different applications.

## Architecture

### Design System Components (ehr-design-system)

The following components are now available in the design system:

1. **Sidebar** - Main container component
2. **SidebarNavItem** - Navigation item with optional expandable children
3. **SidebarNavSubItem** - Sub-navigation item for nested menus
4. **SidebarFooter** - Footer container for user profile and actions
5. **SidebarFooterAction** - Action button for footer (e.g., Sign out)

### Web Application (ehr-web)

The web application now provides:
- **Navigation configuration** (routes, icons, permissions)
- **Session management** (authentication, user data)
- **Permission filtering** (role-based access control)
- **Business logic** (routing, state management)

## Component Props

### Sidebar

```typescript
interface SidebarProps {
  logo?: ReactNode           // Brand logo element
  brandName: string          // Brand name text
  navigation: ReactNode      // Navigation content
  footer?: ReactNode         // Footer content (user profile, etc.)
  children: ReactNode        // Main content to render alongside sidebar
  topBar?: ReactNode         // Top bar content
  className?: string         // Additional CSS classes
}
```

### SidebarNavItem

```typescript
interface SidebarNavItemProps {
  title: string              // Item title
  icon?: ReactNode          // Icon element
  isActive?: boolean        // Whether the item is active/selected
  children?: ReactNode      // Child items for expandable navigation
  onClick?: () => void      // Click handler
  className?: string        // Additional CSS classes
}
```

### SidebarNavSubItem

```typescript
interface SidebarNavSubItemProps {
  title: string              // Item title
  icon?: ReactNode          // Icon element
  isActive?: boolean        // Whether the item is active/selected
  onClick?: () => void      // Click handler
  className?: string        // Additional CSS classes
}
```

### SidebarFooter

```typescript
interface SidebarFooterProps {
  avatar?: ReactNode        // User avatar element or initial
  userName: string          // User name
  userRole?: string         // User role or subtitle
  actions?: ReactNode       // Action buttons
  className?: string        // Additional CSS classes
}
```

### SidebarFooterAction

```typescript
interface SidebarFooterActionProps {
  icon?: ReactNode          // Icon element
  label: string             // Action label
  onClick?: () => void      // Click handler
  className?: string        // Additional CSS classes
}
```

## Usage Example

```tsx
import {
  Sidebar,
  SidebarNavItem,
  SidebarNavSubItem,
  SidebarFooter,
  SidebarFooterAction
} from '@ehr-connect/design-system'

// Navigation content
const navigationContent = (
  <>
    <Link href="/dashboard">
      <SidebarNavItem
        title="Dashboard"
        icon={<HomeIcon />}
        isActive={pathname === '/dashboard'}
      />
    </Link>
    
    <SidebarNavItem
      title="Users"
      icon={<UsersIcon />}
      isActive={pathname.startsWith('/users')}
    >
      <Link href="/users">
        <SidebarNavSubItem
          title="All Users"
          icon={<UserIcon />}
          isActive={pathname === '/users'}
        />
      </Link>
      <Link href="/users/new">
        <SidebarNavSubItem
          title="Add User"
          icon={<PlusIcon />}
          isActive={pathname === '/users/new'}
        />
      </Link>
    </SidebarNavItem>
  </>
)

// Footer content
const footerContent = (
  <SidebarFooter
    avatar={<UserAvatar />}
    userName="John Doe"
    userRole="Admin"
    actions={
      <SidebarFooterAction
        icon={<LogOutIcon />}
        label="Sign out"
        onClick={handleSignOut}
      />
    }
  />
)

// Top bar content
const topBarContent = (
  <div>
    <h1>Application Title</h1>
  </div>
)

// Render
<Sidebar
  logo={<Logo />}
  brandName="EHR Connect"
  navigation={navigationContent}
  footer={footerContent}
  topBar={topBarContent}
>
  {/* Your page content */}
</Sidebar>
```

## Benefits

1. **Reusability**: Sidebar components can be used in multiple applications
2. **Separation of Concerns**: UI components are separate from business logic
3. **Maintainability**: UI changes are centralized in the design system
4. **Testability**: Components can be tested independently
5. **Consistency**: Ensures consistent UI across applications
6. **Flexibility**: Props allow customization without modifying core components

## Migration Notes

### Before
The admin-sidebar component contained:
- All UI logic (layout, styling, responsiveness)
- Business logic (session management, permissions, routing)
- Navigation configuration
- State management

### After
**Design System** provides:
- Reusable UI components
- Consistent styling and behavior
- Responsive design
- Accessibility features

**Web Application** provides:
- Navigation configuration specific to the app
- Session and authentication management
- Permission-based filtering
- Route handling and state management

## Features Preserved

All features from the original implementation are preserved:
- ✅ Responsive sidebar (mobile & desktop)
- ✅ Mobile menu toggle
- ✅ Expandable/collapsible navigation items
- ✅ Active state highlighting
- ✅ Permission-based filtering
- ✅ User profile display
- ✅ Sign out functionality
- ✅ Dark mode support
- ✅ Smooth animations and transitions

## Building the Design System

After making changes to the design system:

```bash
cd ehr-design-system
npm run build
```

The web application will automatically pick up the changes since it references the local design system package.

## Storybook Stories

Comprehensive Storybook stories have been created for all Sidebar components:

### Sidebar Component Stories
- **Default**: Basic sidebar with navigation, footer, and topbar
- **WithExpandableNavigation**: Sidebar with nested navigation items
- **WithoutFooter**: Sidebar without user footer
- **WithoutTopBar**: Sidebar without top bar
- **MinimalSetup**: Minimal configuration example
- **MedicalTheme**: Healthcare-themed example with medical icons and stats

### SidebarNavItem Stories
- **Default**: Basic navigation item
- **Active**: Active/selected state
- **WithIcon**: Item with icon
- **WithoutIcon**: Text-only item
- **WithChildren**: Expandable item with sub-items
- **Interactive**: Interactive demo showing state changes
- **AllStates**: Showcase of all possible states

### SidebarFooter Stories
- **Default**: Basic footer with user info and sign-out action
- **WithoutRole**: Footer without user role
- **WithoutActions**: Footer with only user info
- **WithMultipleActions**: Footer with multiple action buttons
- **MedicalUser**: Medical professional example
- **WithImageAvatar**: Using actual image as avatar
- **LongUserName**: Handling long text with truncation

### Running Storybook

To view the components in Storybook:

```bash
cd ehr-design-system
npm run storybook
```

This will start Storybook on `http://localhost:6006` where you can:
- View all component variations
- Interact with component props
- Test different states and configurations
- View auto-generated documentation
- Test dark mode support

## Future Enhancements

Potential improvements:
1. ✅ Add Storybook stories for each Sidebar component (Completed)
2. Add unit tests for component behavior
3. Support for collapsible sidebar
4. Support for different sidebar widths
5. Support for custom themes
6. Add keyboard navigation support
7. Add search functionality in navigation

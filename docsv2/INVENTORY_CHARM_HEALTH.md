Fetch(https://www.charmhealth.com/resources/inventory/manag
       e-inventory.html)
  ⎿  Received 45KB (200 OK)

⏺ Perfect! I can see the CharmHealth inventory workflow.
  Now let me explore your current inventory module to
  understand what exists and what needs to be aligned
  with this workflow.

⏺ Explore(Explore inventory module structure)
  ⎿  Done (22 tool uses · 52.4k tokens · 3m 14s)        

⏺ Excellent! Now I have a complete picture. Let me create
   a comprehensive implementation plan to align your
  inventory module with the CharmHealth workflow.

⏺ Implementation Plan: CharmHealth-Aligned Inventory 
  Module

  Based on my analysis, here's the comprehensive plan to
  align your inventory module with CharmHealth's
  workflow:

  📋 Gap Analysis Summary

  CharmHealth Workflow → Your Current System

  | CharmHealth Feature                 | Your
  Implementation | Status            |
  |-------------------------------------|----------------
  -----|-------------------|
  | Individual product addition         | ✅ Implemented
        | Complete          |
  | Bulk Add Inventory                  | ❌ Missing
        | Critical          |
  | CSV Import/Export                   | ❌ Missing
        | Critical          |
  | Stock detail viewing                | ✅ Implemented
        | Complete          |
  | Edit product details                | ❌ Missing
        | Critical          |
  | Status toggle (active/inactive)     | ❌ Missing
        | Critical          |
  | Product deletion                    | ❌ Missing
        | Important         |
  | Damaged/expired tracking            | ❌ Missing
        | Critical          |
  | Reorder level configuration         | ✅ Implemented
        | Complete          |
  | Stock history with user attribution | ⚠️ Partial
       | Needs enhancement |
  | Activity audit trails               | ⚠️ Partial
       | Needs enhancement |
  | Reports & Export                    | ❌ Missing
        | Critical          |
  | Multi-store/facility support        | ⚠️ Partial
       | Needs enhancement |
  | Settings integration                | ❌ Missing
        | Important         |

  ---
  🏗️ Proposed Architecture

  Current: Single-page monolith (1,647 lines)Proposed:
  Modular feature-based architecture

  src/features/inventory/
  ├── components/
  │   ├── dashboard/
  │   │   ├── OverviewCards.tsx
  │   │   ├── LowStockPanel.tsx
  │   │   ├── ExpiringLotsPanel.tsx
  │   │   └── ControlledSubstancesPanel.tsx
  │   ├── items/
  │   │   ├── ItemsTable.tsx
  │   │   ├── ItemDetailView.tsx
  │   │   ├── ItemForm.tsx
  │   │   ├── BulkAddForm.tsx
  │   │   └── ItemActionsMenu.tsx
  │   ├── lots/
  │   │   ├── LotsTable.tsx
  │   │   ├── ReceiveLotForm.tsx
  │   │   └── LotDetailView.tsx
  │   ├── movements/
  │   │   ├── MovementsTable.tsx
  │   │   ├── RecordMovementForm.tsx
  │   │   └── MovementHistory.tsx
  │   ├── import-export/
  │   │   ├── CSVImportDialog.tsx
  │   │   ├── CSVExportDialog.tsx
  │   │   └── ImportErrorPanel.tsx
  │   ├── suppliers/
  │   │   ├── SuppliersTable.tsx
  │   │   └── SupplierForm.tsx
  │   ├── categories/
  │   │   ├── CategoriesTable.tsx
  │   │   └── CategoryForm.tsx
  │   └── reports/
  │       ├── StockReport.tsx
  │       ├── ActivityReport.tsx
  │       └── ReorderReport.tsx
  ├── hooks/
  │   ├── useInventoryItems.ts
  │   ├── useInventoryLots.ts
  │   ├── useStockMovements.ts
  │   └── useInventoryOverview.ts
  ├── store/
  │   └── inventory-store.ts (Zustand)
  └── utils/
      ├── csv-parser.ts
      ├── inventory-validators.ts
      └── stock-calculations.ts

  src/app/inventory/
  ├── page.tsx (Dashboard)
  ├── items/
  │   ├── page.tsx (Items List)
  │   └── [itemId]/
  │       └── page.tsx (Item Detail)
  ├── suppliers/
  │   └── page.tsx
  ├── categories/
  │   └── page.tsx
  ├── reports/
  │   └── page.tsx
  └── settings/
      └── page.tsx

  ---
  🎯 Implementation Roadmap

  Phase 1: Critical Features (Week 1-2)

  1. Edit/Update Operations
    - Add PUT endpoints to service layer
    - Create edit forms for items, lots, suppliers,
  categories
    - Implement "More Options (...)" context menu
    - Add inline editing capabilities
  2. Bulk Add Inventory
    - Create BulkAddForm.tsx component
    - Implement supplier/date pre-fill pattern
    - Add multiple item entry table
    - Save all items in single transaction
  3. CSV Import/Export
    - Create CSV parser utility
    - Implement import dialog with error validation
    - Add export functionality (all stocks, available
  only, reorder level)
    - Support multi-store import with facility mapping
  4. Status Management
    - Add active/inactive toggle to items
    - Implement soft delete functionality
    - Filter views by status
    - Audit status changes

  Phase 2: Enhanced Tracking (Week 3-4)

  5. Damaged/Expired Stock Tracking
    - Add "Adjustment" reason types: Damaged, Expired,
  Returned
    - Create dedicated movement forms for waste tracking
    - Display damaged/expired counts in item view
    - Add expiration date warnings
  6. Enhanced Stock History
    - Add user attribution to all movements
    - Implement detailed audit trail view
    - Add timestamp and reason tracking
    - Create activity timeline component
  7. Reports & Analytics
    - Create reports page
    - Implement stock activity report
    - Add product activity report (additions,
  modifications, returns)
    - Create reorder level report
    - Add export functionality

  Phase 3: Multi-Store & Advanced Features (Week 5-6)

  8. Multi-Store Management
    - Implement facility-specific inventory stores
    - Add cross-facility stock visibility
    - Create transfer workflows
    - Implement facility-based export/import
  9. Settings Integration
    - Create Settings > Inventory page
    - Add auto-population configuration
    - Implement provider visibility settings
    - Configure reorder notifications
  10. Performance & UX
    - Add pagination UI
    - Implement infinite scroll
    - Add keyboard shortcuts
    - Optimize data fetching

  ---
  🔧 Immediate Next Steps

  Would you like me to:

  1. Start with modular refactoring - Break down the
  monolithic page into reusable components
  2. Implement bulk add feature - Add the ability to add
  multiple items at once
  3. Add CSV import/export - Critical for data management
  4. Implement edit operations - Allow updating items,
  lots, suppliers, categories
  5. Create the reports module - Activity reports and
  export functionality

  Which area would you like me to tackle first? I
  recommend starting with edit operations + bulk add as
  these are the most critical gaps compared to
  CharmHealth's workflow.

  Todos
  ☒Analyze CharmHealth workflow vs current implementation 
   gaps
  ☐ Create modular architecture plan for inventory module
  ☐ Design route structure and navigation flow
  ☐ Implement bulk add inventory feature
  ☐ Add CSV import/export functionality
  ☐ Implement edit/update operations for items
  ☐ Add stock detail view with complete transaction history
  ☐ Implement active/inactive status toggle
  ☐ Add damaged/expired stock tracking
  ☐ Create reports and export functionality
  ☐ Add multi-store/facility management

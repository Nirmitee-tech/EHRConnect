export interface InventoryCategory {
  id: string
  orgId?: string
  name: string
  description?: string | null
  isActive: boolean
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export interface InventorySupplier {
  id: string
  orgId?: string
  name: string
  code?: string | null
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  address?: Record<string, unknown> | null
  notes?: string | null
  isActive: boolean
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export interface InventoryLot {
  id: string
  itemId?: string
  lotNumber: string
  serialNumber?: string | null
  barcode?: string | null
  expirationDate?: string | null
  manufactureDate?: string | null
  quantityOnHand: number
  quantityReserved: number
  status: string
  receivedAt?: string | null
  openedAt?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
  locationId?: string | null
  locationName?: string | null
  supplierId?: string | null
  supplierName?: string | null
}

export interface InventoryItem {
  id: string
  orgId?: string
  name: string
  sku?: string | null
  description?: string | null
  unitOfMeasure: string
  trackLots: boolean
  trackExpiration: boolean
  allowPartialQuantity: boolean
  minStockLevel?: number | null
  maxStockLevel?: number | null
  reorderPoint?: number | null
  reorderQuantity?: number | null
  costPerUnit?: number | null
  isControlledSubstance: boolean
  isActive: boolean
  metadata?: Record<string, unknown> | null
  categoryId?: string | null
  categoryName?: string | null
  defaultLocationId?: string | null
  quantityOnHand: number
  quantityReserved: number
  nextExpiration?: string | null
  createdAt?: string
  updatedAt?: string
  lots?: InventoryLot[]
  locations?: Array<{
    id: string
    locationId: string
    parLevel?: number | null
    reorderPoint?: number | null
    reorderQuantity?: number | null
    maxLevel?: number | null
    isPrimary: boolean
    notes?: string | null
    metadata?: Record<string, unknown> | null
    createdAt?: string
    updatedAt?: string
  }>
}

export interface StockMovement {
  id: string
  orgId?: string
  itemId: string
  lotId?: string | null
  lotNumber?: string | null
  itemName?: string | null
  movementType: string
  direction: 'in' | 'out'
  quantity: number
  sourceLocationId?: string | null
  sourceLocationName?: string | null
  destinationLocationId?: string | null
  destinationLocationName?: string | null
  occurredAt: string
  referenceType?: string | null
  referenceId?: string | null
  reason?: string | null
  notes?: string | null
  unitCost?: number | null
  performedBy?: string | null
  performedByName?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
}

export interface InventoryOverview {
  totals: {
    totalItems: number
    activeItems: number
    totalQuantity: number
    totalValue: number
  }
  lowStock: Array<{
    id: string
    name: string
    reorderPoint?: number | null
    reorderQuantity?: number | null
    quantityOnHand: number
  }>
  expiringLots: Array<{
    id: string
    itemName: string
    lotNumber: string
    expirationDate: string
    quantityOnHand: number
    locationName?: string | null
  }>
  controlledSubstances: Array<{
    id: string
    name: string
    quantityOnHand: number
  }>
}

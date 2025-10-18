
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Package,
  AlertTriangle,
  Clock,
  Beaker,
  Plus,
  RefreshCcw,
  ClipboardList,
  Building2,
  ShieldCheck,
  Layers,
  Archive,
  X,
  MoveRight,
  MoveLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useFacility } from '@/contexts/facility-context'
import { inventoryApi } from '@/services/inventory.service'
import type {
  InventoryCategory,
  InventoryItem,
  InventoryLot,
  InventoryOverview,
  InventorySupplier,
  StockMovement,
} from '@/types/inventory'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US')

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch (error) {
    return value
  }
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null

type MovementFormState = {
  movementType: string
  direction: 'in' | 'out'
  lotId: string
  quantity: string
  reason: string
  notes: string
  sourceLocationId: string
  destinationLocationId: string
  unitCost: string
}

type LotFormState = {
  lotNumber: string
  serialNumber: string
  quantityOnHand: string
  expirationDate: string
  manufactureDate: string
  supplierId: string
  locationId: string
  unitCost: string
  notes: string
  reason: string
}

type ItemFormState = {
  name: string
  sku: string
  description: string
  unitOfMeasure: string
  categoryId: string
  trackLots: boolean
  trackExpiration: boolean
  allowPartialQuantity: boolean
  isControlledSubstance: boolean
  reorderPoint: string
  reorderQuantity: string
  costPerUnit: string
}

type SupplierFormState = {
  name: string
  code: string
  contactName: string
  contactPhone: string
  contactEmail: string
  notes: string
}

type CategoryFormState = {
  name: string
  description: string
  isActive: boolean
}

const MOVEMENT_TYPES: Array<{ value: string; label: string; direction: 'in' | 'out' | 'either'; helper: string }> = [
  { value: 'receipt', label: 'Stock Receipt', direction: 'in', helper: 'Receiving inventory into stock' },
  { value: 'issue', label: 'Clinical Issue', direction: 'out', helper: 'Issuing supplies to procedures or patients' },
  { value: 'adjustment', label: 'Inventory Adjustment', direction: 'either', helper: 'Manual corrections or cycle count adjustments' },
  { value: 'transfer', label: 'Location Transfer', direction: 'either', helper: 'Moving inventory between storage locations' },
  { value: 'waste', label: 'Waste / Loss', direction: 'out', helper: 'Expired, damaged, or wasted stock' },
]

function OverviewCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: typeof Package
  label: string
  value: string
  sublabel?: string
  accent: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {sublabel && <p className="text-sm text-gray-500 mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth()
  const { currentFacility } = useFacility()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [fetchingContext, setFetchingContext] = useState(false)

  const [overview, setOverview] = useState<InventoryOverview | null>(null)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])

  const [loadingItems, setLoadingItems] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({ search: '', categoryId: 'all', includeInactive: false })

  const [showItemSheet, setShowItemSheet] = useState(false)
  const [showLotSheet, setShowLotSheet] = useState(false)
  const [showMovementSheet, setShowMovementSheet] = useState(false)
  const [showSupplierSheet, setShowSupplierSheet] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)

  const [itemForm, setItemForm] = useState<ItemFormState>({
    name: '',
    sku: '',
    description: '',
    unitOfMeasure: 'each',
    categoryId: '',
    trackLots: true,
    trackExpiration: true,
    allowPartialQuantity: false,
    isControlledSubstance: false,
    reorderPoint: '',
    reorderQuantity: '',
    costPerUnit: '',
  })

  const [lotForm, setLotForm] = useState<LotFormState>({
    lotNumber: '',
    serialNumber: '',
    quantityOnHand: '',
    expirationDate: '',
    manufactureDate: '',
    supplierId: '',
    locationId: '',
    unitCost: '',
    notes: '',
    reason: 'New stock receipt',
  })

  const [movementForm, setMovementForm] = useState<MovementFormState>({
    movementType: 'issue',
    direction: 'out',
    lotId: '',
    quantity: '',
    reason: 'Clinical usage',
    notes: '',
    sourceLocationId: '',
    destinationLocationId: '',
    unitCost: '',
  })

  const [supplierForm, setSupplierForm] = useState<SupplierFormState>({
    name: '',
    code: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  })

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>({
    name: '',
    description: '',
    isActive: true,
  })

  const isLoadingSession = isLoading

  useEffect(() => {
    if (!isAuthenticated) {
      setOrgId(null)
      setUserId(null)
      return
    }

    if (user?.org_id) {
      setOrgId(user?.org_id)
      setUserId((user as any)?.id || user?.email || null)
    } else if (user?.email && !fetchingContext) {
      fetchUserContext(user.email)
    }
  }, [session])

  useEffect(() => {
    if (orgId) {
      loadSummary()
      loadCategories()
      loadSuppliers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, currentFacility?.id])

  useEffect(() => {
    if (orgId) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, filters.search, filters.categoryId, filters.includeInactive, currentFacility?.id])

  const fetchUserContext = async (email: string) => {
    try {
      setFetchingContext(true)
      const response = await fetch(
        `${API_BASE.replace(/\/$/, '')}/api/auth/user-context?email=${encodeURIComponent(email)}`
      )

      if (response.ok) {
        const context = await response.json()
        if (context?.org_id) {
          setOrgId(context.org_id)
        }
        if (context?.user_id) {
          setUserId(context.user_id)
        }
      }
    } catch (contextError) {
      console.error('Failed to fetch user context', contextError)
    } finally {
      setFetchingContext(false)
    }
  }

  const resetFeedback = () => setFeedback(null)

  const loadSummary = async () => {
    if (!orgId) return
    try {
      const data = await inventoryApi.getOverview(orgId, userId || undefined, {
        locationId: currentFacility?.id,
      })
      setOverview(data)
    } catch (summaryError) {
      console.error('Failed to load inventory overview', summaryError)
      setError((summaryError as Error).message)
    }
  }

  const loadCategories = async () => {
    if (!orgId) return
    try {
      const data = await inventoryApi.listCategories(orgId, userId || undefined)
      setCategories(data)
    } catch (categoryError) {
      console.error('Failed to load categories', categoryError)
    }
  }

  const loadSuppliers = async () => {
    if (!orgId) return
    try {
      const data = await inventoryApi.listSuppliers(orgId, userId || undefined)
      setSuppliers(data)
    } catch (supplierError) {
      console.error('Failed to load suppliers', supplierError)
    }
  }

  const loadItems = async () => {
    if (!orgId) return

    try {
      setLoadingItems(true)
      const data = await inventoryApi.listItems(orgId, userId || undefined, {
        search: filters.search,
        categoryId: filters.categoryId === 'all' ? undefined : filters.categoryId,
        includeInactive: filters.includeInactive,
        locationId: currentFacility?.id,
        limit: 100,
      })

      setItems(data)

      if (data.length === 0) {
        setSelectedItem(null)
        setMovements([])
      } else if (!selectedItem || !data.some(item => item.id === selectedItem.id)) {
        handleSelectItem(data[0].id)
      }
    } catch (itemsError) {
      console.error('Failed to load items', itemsError)
      setError((itemsError as Error).message)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSelectItem = async (itemId: string) => {
    if (!orgId) return
    try {
      setLoadingDetail(true)
      const detail = await inventoryApi.getItem(orgId, userId || undefined, itemId)
      setSelectedItem(detail)

      const movementData = await inventoryApi.listStockMovements(orgId, userId || undefined, {
        itemId,
        limit: 20,
      })
      setMovements(movementData)
    } catch (detailError) {
      console.error('Failed to load item detail', detailError)
      setFeedback({ type: 'error', message: (detailError as Error).message })
    } finally {
      setLoadingDetail(false)
    }
  }

  const openItemDrawer = () => {
    setItemForm({
      name: '',
      sku: '',
      description: '',
      unitOfMeasure: 'each',
      categoryId: categories[0]?.id || '',
      trackLots: true,
      trackExpiration: true,
      allowPartialQuantity: false,
      isControlledSubstance: false,
      reorderPoint: '',
      reorderQuantity: '',
      costPerUnit: '',
    })
    setShowItemSheet(true)
  }

  const openLotDrawer = () => {
    setLotForm({
      lotNumber: '',
      serialNumber: '',
      quantityOnHand: '',
      expirationDate: '',
      manufactureDate: '',
      supplierId: '',
      locationId: selectedItem?.defaultLocationId || currentFacility?.id || '',
      unitCost: selectedItem?.costPerUnit ? String(selectedItem.costPerUnit) : '',
      notes: '',
      reason: 'New stock receipt',
    })
    setShowLotSheet(true)
  }

  const openMovementDrawer = () => {
    setMovementForm({
      movementType: 'issue',
      direction: 'out',
      lotId: '',
      quantity: '',
      reason: 'Clinical usage',
      notes: '',
      sourceLocationId: selectedItem?.defaultLocationId || currentFacility?.id || '',
      destinationLocationId: '',
      unitCost: '',
    })
    setShowMovementSheet(true)
  }

  const openSupplierDrawer = () => {
    setSupplierForm({
      name: '',
      code: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    })
    setShowSupplierSheet(true)
  }

  const openCategoryDrawer = () => {
    setCategoryForm({ name: '', description: '', isActive: true })
    setShowCategorySheet(true)
  }

  const handleCreateItem = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgId) return

    try {
      const payload = {
        name: itemForm.name,
        sku: itemForm.sku || undefined,
        description: itemForm.description || undefined,
        unitOfMeasure: itemForm.unitOfMeasure || 'each',
        categoryId: itemForm.categoryId || undefined,
        trackLots: itemForm.trackLots,
        trackExpiration: itemForm.trackExpiration,
        allowPartialQuantity: itemForm.allowPartialQuantity,
        isControlledSubstance: itemForm.isControlledSubstance,
        reorderPoint: itemForm.reorderPoint ? Number(itemForm.reorderPoint) : undefined,
        reorderQuantity: itemForm.reorderQuantity ? Number(itemForm.reorderQuantity) : undefined,
        costPerUnit: itemForm.costPerUnit ? Number(itemForm.costPerUnit) : undefined,
      }

      const created = await inventoryApi.createItem(orgId, userId || undefined, payload)
      setFeedback({ type: 'success', message: `Created inventory item “${created.name}”.` })
      setShowItemSheet(false)
      await loadItems()
      await loadSummary()
      await handleSelectItem(created.id)
    } catch (createError) {
      console.error('Failed to create item', createError)
      setFeedback({ type: 'error', message: (createError as Error).message })
    }
  }

  const handleCreateLot = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgId || !selectedItem) return

    try {
      const payload = {
        lotNumber: lotForm.lotNumber,
        serialNumber: lotForm.serialNumber || undefined,
        expirationDate: lotForm.expirationDate || undefined,
        manufactureDate: lotForm.manufactureDate || undefined,
        supplierId: lotForm.supplierId || undefined,
        locationId: lotForm.locationId || undefined,
        unitCost: lotForm.unitCost ? Number(lotForm.unitCost) : undefined,
        notes: lotForm.notes || undefined,
        quantityOnHand: lotForm.quantityOnHand ? Number(lotForm.quantityOnHand) : 0,
        reason: lotForm.reason || 'New stock receipt',
      }

      const created = await inventoryApi.createLot(orgId, userId || undefined, selectedItem.id, payload)
      setFeedback({ type: 'success', message: `Lot ${created.lotNumber} received for ${selectedItem.name}.` })
      setShowLotSheet(false)
      await handleSelectItem(selectedItem.id)
      await loadSummary()
    } catch (lotError) {
      console.error('Failed to create lot', lotError)
      setFeedback({ type: 'error', message: (lotError as Error).message })
    }
  }

  const handleRecordMovement = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgId || !selectedItem) return

    try {
      const payload = {
        itemId: selectedItem.id,
        lotId: movementForm.lotId || undefined,
        quantity: movementForm.quantity ? Number(movementForm.quantity) : 0,
        movementType: movementForm.movementType,
        direction: movementForm.direction,
        sourceLocationId: movementForm.sourceLocationId || undefined,
        destinationLocationId: movementForm.destinationLocationId || undefined,
        reason: movementForm.reason || undefined,
        notes: movementForm.notes || undefined,
        unitCost: movementForm.unitCost ? Number(movementForm.unitCost) : undefined,
      }

      const movement = await inventoryApi.recordStockMovement(orgId, userId || undefined, payload)
      setFeedback({
        type: 'success',
        message: `Recorded ${movement.direction === 'in' ? 'inbound' : 'outbound'} movement of ${movement.quantity} for ${selectedItem.name}.`,
      })
      setShowMovementSheet(false)
      await handleSelectItem(selectedItem.id)
      await loadSummary()
    } catch (movementError) {
      console.error('Failed to record movement', movementError)
      setFeedback({ type: 'error', message: (movementError as Error).message })
    }
  }

  const handleCreateSupplier = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgId) return

    try {
      const payload = {
        name: supplierForm.name,
        code: supplierForm.code || undefined,
        contactName: supplierForm.contactName || undefined,
        contactPhone: supplierForm.contactPhone || undefined,
        contactEmail: supplierForm.contactEmail || undefined,
        notes: supplierForm.notes || undefined,
      }

      const created = await inventoryApi.createSupplier(orgId, userId || undefined, payload)
      setFeedback({ type: 'success', message: `Supplier “${created.name}” added.` })
      setShowSupplierSheet(false)
      await loadSuppliers()
    } catch (supplierError) {
      console.error('Failed to create supplier', supplierError)
      setFeedback({ type: 'error', message: (supplierError as Error).message })
    }
  }

  const handleCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orgId) return

    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        isActive: categoryForm.isActive,
      }

      const created = await inventoryApi.createCategory(orgId, userId || undefined, payload)
      setFeedback({ type: 'success', message: `Category “${created.name}” created.` })
      setShowCategorySheet(false)
      await loadCategories()
    } catch (categoryError) {
      console.error('Failed to create category', categoryError)
      setFeedback({ type: 'error', message: (categoryError as Error).message })
    }
  }

  const filteredSuppliers = useMemo(() => suppliers.slice(0, 6), [suppliers])
  const hasSessionContext = Boolean(orgId)

  if (isLoadingSession || fetchingContext) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-600">
        <div className="flex items-center gap-3 text-sm">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          Preparing inventory workspace...
        </div>
      </div>
    )
  }

  if (!hasSessionContext) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <Package className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Inventory workspace unavailable</h1>
        <p className="mt-2 text-gray-600">
          We could not determine your organization context. Please refresh the page or sign out and back in to continue.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold">
            <Layers className="h-4 w-4" /> Inventory Operations
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Control Center</h1>
          <p className="text-gray-600 max-w-2xl">
            Monitor stock health, manage supplier lots, and keep every medication, vaccine, and supply ready for care delivery.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={openCategoryDrawer} variant="outline" className="gap-2">
            <Archive className="h-4 w-4" /> Category
          </Button>
          <Button onClick={openSupplierDrawer} variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" /> Supplier
          </Button>
          <Button onClick={openItemDrawer} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" /> New Item
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedItem}
            onClick={() => selectedItem && openLotDrawer()}
          >
            <MoveRight className="h-4 w-4" /> Receive Stock
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedItem}
            onClick={() => selectedItem && openMovementDrawer()}
          >
            <MoveLeft className="h-4 w-4" /> Record Movement
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex-1">
            <p className="font-semibold">{feedback.type === 'success' ? 'Action complete' : 'Action required'}</p>
            <p className="text-sm mt-1">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={resetFeedback}
            className="rounded-full p-1 hover:bg-black/10"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
          <p className="font-semibold">We hit a snag</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <OverviewCard
          icon={Package}
          label="Active Items"
          value={overview ? numberFormatter.format(overview.totals.activeItems) : '—'}
          sublabel={overview ? `${overview.totals.totalItems} total` : 'Loading inventory totals'}
          accent="bg-indigo-500"
        />
        <OverviewCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={overview ? numberFormatter.format(overview.lowStock.length) : '—'}
          sublabel="Items at or below reorder point"
          accent="bg-amber-500"
        />
        <OverviewCard
          icon={Clock}
          label="Expiring Lots"
          value={overview ? numberFormatter.format(overview.expiringLots.length) : '—'}
          sublabel="Within the next 30 days"
          accent="bg-rose-500"
        />
        <OverviewCard
          icon={Beaker}
          label="Inventory Value"
          value={overview ? currencyFormatter.format(overview.totals.totalValue || 0) : '—'}
          sublabel={`On-hand qty ${overview ? numberFormatter.format(overview.totals.totalQuantity || 0) : '—'}`}
          accent="bg-emerald-500"
        />
      </section>

      
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Inventory Catalog</h2>
                <p className="text-sm text-gray-500">Filter and select items to manage lots and movements.</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <Input
                    value={filters.search}
                    onChange={event => setFilters(prev => ({ ...prev, search: event.target.value }))}
                    placeholder="Search by name or SKU..."
                    className="pl-3 pr-10"
                  />
                </div>
                <select
                  value={filters.categoryId}
                  onChange={event => setFilters(prev => ({ ...prev, categoryId: event.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <Checkbox
                    checked={filters.includeInactive}
                    onCheckedChange={checked =>
                      setFilters(prev => ({ ...prev, includeInactive: Boolean(checked) }))
                    }
                  />
                  Include inactive
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    loadItems()
                    loadSummary()
                  }}
                >
                  <RefreshCcw className="h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">On Hand</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Reserved</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Next Exp.</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loadingItems ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCcw className="h-4 w-4 animate-spin" /> Loading inventory items...
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No items match the current filters.
                      </td>
                    </tr>
                  ) : (
                    items.map(item => {
                      const isSelected = selectedItem?.id === item.id
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-indigo-50/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/80' : ''
                          }`}
                          onClick={() => handleSelectItem(item.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">SKU: {item.sku || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.categoryName || 'Uncategorized'}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                            {numberFormatter.format(item.quantityOnHand || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-600">
                            {numberFormatter.format(item.quantityReserved || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.nextExpiration)}</td>
                          <td className="px-6 py-4 text-right">
                            <Badge className={item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expiring Lots</h3>
                <p className="text-sm text-gray-500">Monitor lots approaching expiration.</p>
              </div>
              <Badge className="bg-rose-50 text-rose-600">
                {overview ? `${overview.expiringLots.length} lots` : '—'}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {overview && overview.expiringLots.length > 0 ? (
                overview.expiringLots.map(lot => (
                  <div
                    key={lot.id}
                    className="border border-rose-100 rounded-xl px-4 py-3 bg-rose-50/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lot.itemName}</p>
                      <p className="text-xs text-gray-500">Lot {lot.lotNumber} • Qty {numberFormatter.format(lot.quantityOnHand)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Expires</p>
                      <p className="text-sm font-semibold text-rose-600">{formatDate(lot.expirationDate)}</p>
                      <p className="text-xs text-gray-500">{lot.locationName || 'Unknown location'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center text-sm text-gray-500">
                  No lots are expiring within the next 30 days.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <p className="text-sm text-gray-500">Organize items by clinical usage.</p>
              </div>
              <Button size="sm" variant="ghost" className="gap-1" onClick={openCategoryDrawer}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories defined yet.</p>
              ) : (
                categories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                      {category.description && <p className="text-xs text-gray-500">{category.description}</p>}
                    </div>
                    <Badge className={category.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trusted Suppliers</h3>
                <p className="text-sm text-gray-500">Maintain vendor traceability for lot management.</p>
              </div>
              <Button size="sm" variant="ghost" className="gap-1" onClick={openSupplierDrawer}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {filteredSuppliers.length === 0 ? (
                <p className="text-sm text-gray-500">Add suppliers to capture ordering and traceability details.</p>
              ) : (
                filteredSuppliers.map(supplier => (
                  <div key={supplier.id} className="border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                    <p className="text-xs text-gray-500">
                      {supplier.code ? `Vendor Code ${supplier.code}` : 'No vendor code assigned'}
                    </p>
                    {supplier.contactEmail && (
                      <p className="text-xs text-gray-500 mt-1">{supplier.contactEmail}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Controlled Substances</h3>
                <p className="text-sm text-gray-500">Monitor DEA-regulated quantities.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-4 space-y-3">
              {overview && overview.controlledSubstances.length > 0 ? (
                overview.controlledSubstances.map(item => (
                  <div key={item.id} className="border border-indigo-100 rounded-xl px-4 py-3 bg-indigo-50/40">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      On hand: {numberFormatter.format(item.quantityOnHand || 0)} units
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No controlled substances tracked yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Item Detail & Workflow</h2>
            <p className="text-sm text-gray-500">
              Review location balances, lot status, and recent stock movements for the selected item.
            </p>
          </div>
          {selectedItem && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge className="bg-indigo-50 text-indigo-600">{selectedItem.categoryName || 'Uncategorized'}</Badge>
              <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
                SKU <span className="font-semibold text-gray-900">{selectedItem.sku || 'Not assigned'}</span>
              </div>
              {selectedItem.isControlledSubstance && (
                <Badge className="bg-emerald-50 text-emerald-600">Controlled</Badge>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> Loading item details...
            </div>
          ) : !selectedItem ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center text-sm text-gray-500">
              Select an item from the catalog to view detailed lot and movement information.
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">On-hand Quantity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {numberFormatter.format(selectedItem.quantityOnHand || 0)} {selectedItem.unitOfMeasure}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reserved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {numberFormatter.format(selectedItem.quantityReserved || 0)} {selectedItem.unitOfMeasure}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reorder Point</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {selectedItem.reorderPoint ? numberFormatter.format(selectedItem.reorderPoint) : 'Not set'}
                  </p>
                  <p className="text-xs text-gray-500">Reorder qty {selectedItem.reorderQuantity || '—'}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Next Expiration</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedItem.nextExpiration)}</p>
                  <p className="text-xs text-gray-500">
                    {selectedItem.trackExpiration ? 'Expiration tracking enabled' : 'Expiration not tracked'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Lots</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => selectedItem && openLotDrawer()}
                  >
                    <Plus className="h-4 w-4" /> Receive lot
                  </Button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Lot</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Expiration</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">On Hand</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Reserved</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedItem.lots && selectedItem.lots.length > 0 ? (
                        selectedItem.lots.map((lot: InventoryLot) => (
                          <tr key={lot.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{lot.lotNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(lot.expirationDate)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                              {numberFormatter.format(lot.quantityOnHand || 0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">
                              {numberFormatter.format(lot.quantityReserved || 0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{lot.locationName || lot.locationId || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{lot.supplierName || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                            No lots recorded yet for this item.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Recent Movements</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => selectedItem && openMovementDrawer()}
                  >
                    <ClipboardList className="h-4 w-4" /> Log movement
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">When</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Lot</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Performed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {movements.length > 0 ? (
                        movements.map(movement => (
                          <tr key={movement.id}>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(movement.occurredAt)}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                className={
                                  movement.direction === 'in'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }
                              >
                                {movement.movementType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{movement.lotNumber || '—'}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                              {movement.direction === 'out' ? '-' : '+'}
                              {numberFormatter.format(Math.abs(movement.quantity || 0))}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{movement.reason || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{movement.performedByName || movement.performedBy || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                            No stock movements logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Item Sheet */}
      <Sheet open={showItemSheet} onOpenChange={setShowItemSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create inventory item</SheetTitle>
            <SheetDescription>
              Capture tracking preferences, reorder thresholds, and cost data for a new stock item.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-6" onSubmit={handleCreateItem}>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Item name *</Label>
                <Input
                  required
                  value={itemForm.name}
                  onChange={event => setItemForm(prev => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g., 10mL Lidocaine Vial"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">SKU</Label>
                  <Input
                    value={itemForm.sku}
                    onChange={event => setItemForm(prev => ({ ...prev, sku: event.target.value }))}
                    placeholder="Internal SKU"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Unit of measure</Label>
                  <Input
                    value={itemForm.unitOfMeasure}
                    onChange={event => setItemForm(prev => ({ ...prev, unitOfMeasure: event.target.value }))}
                    placeholder="each, vial, box"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Category</Label>
                <select
                  value={itemForm.categoryId}
                  onChange={event => setItemForm(prev => ({ ...prev, categoryId: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <textarea
                  value={itemForm.description}
                  onChange={event => setItemForm(prev => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="How is this item used clinically?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Reorder point</Label>
                <Input
                  type="number"
                  min={0}
                  value={itemForm.reorderPoint}
                  onChange={event => setItemForm(prev => ({ ...prev, reorderPoint: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Reorder quantity</Label>
                <Input
                  type="number"
                  min={0}
                  value={itemForm.reorderQuantity}
                  onChange={event => setItemForm(prev => ({ ...prev, reorderQuantity: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Cost per unit</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={itemForm.costPerUnit}
                  onChange={event => setItemForm(prev => ({ ...prev, costPerUnit: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Checkbox
                  checked={itemForm.trackLots}
                  onCheckedChange={checked => setItemForm(prev => ({ ...prev, trackLots: Boolean(checked) }))}
                />
                Track lots
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Checkbox
                  checked={itemForm.trackExpiration}
                  onCheckedChange={checked => setItemForm(prev => ({ ...prev, trackExpiration: Boolean(checked) }))}
                />
                Track expirations
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Checkbox
                  checked={itemForm.allowPartialQuantity}
                  onCheckedChange={checked => setItemForm(prev => ({ ...prev, allowPartialQuantity: Boolean(checked) }))}
                />
                Allow partial dispensing
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Checkbox
                  checked={itemForm.isControlledSubstance}
                  onCheckedChange={checked => setItemForm(prev => ({ ...prev, isControlledSubstance: Boolean(checked) }))}
                />
                Controlled substance
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowItemSheet(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save item
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Lot Sheet */}
      <Sheet open={showLotSheet} onOpenChange={setShowLotSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Receive lot</SheetTitle>
            <SheetDescription>Record traceability details for an inbound lot.</SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-6" onSubmit={handleCreateLot}>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Lot number *</Label>
                <Input
                  required
                  value={lotForm.lotNumber}
                  onChange={event => setLotForm(prev => ({ ...prev, lotNumber: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Serial number</Label>
                <Input
                  value={lotForm.serialNumber}
                  onChange={event => setLotForm(prev => ({ ...prev, serialNumber: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Quantity received</Label>
                  <Input
                    type="number"
                    min={0}
                    value={lotForm.quantityOnHand}
                    onChange={event => setLotForm(prev => ({ ...prev, quantityOnHand: event.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Unit cost</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={lotForm.unitCost}
                    onChange={event => setLotForm(prev => ({ ...prev, unitCost: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Expiration date</Label>
                  <Input
                    type="date"
                    value={lotForm.expirationDate}
                    onChange={event => setLotForm(prev => ({ ...prev, expirationDate: event.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Manufacture date</Label>
                  <Input
                    type="date"
                    value={lotForm.manufactureDate}
                    onChange={event => setLotForm(prev => ({ ...prev, manufactureDate: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Supplier</Label>
                <select
                  value={lotForm.supplierId}
                  onChange={event => setLotForm(prev => ({ ...prev, supplierId: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Location ID</Label>
                <Input
                  value={lotForm.locationId}
                  onChange={event => setLotForm(prev => ({ ...prev, locationId: event.target.value }))}
                  placeholder="Destination storage location"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Reason</Label>
                <Input
                  value={lotForm.reason}
                  onChange={event => setLotForm(prev => ({ ...prev, reason: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  value={lotForm.notes}
                  onChange={event => setLotForm(prev => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Optional receiving notes"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowLotSheet(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Receive lot
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Movement Sheet */}
      <Sheet open={showMovementSheet} onOpenChange={setShowMovementSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record stock movement</SheetTitle>
            <SheetDescription>Document adjustments, usage, transfers, or waste events.</SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-6" onSubmit={handleRecordMovement}>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Movement type</Label>
                <select
                  value={movementForm.movementType}
                  onChange={event => {
                    const type = event.target.value
                    const config = MOVEMENT_TYPES.find(option => option.value === type)
                    setMovementForm(prev => ({
                      ...prev,
                      movementType: type,
                      direction: config?.direction === 'either' ? prev.direction : config?.direction || 'out',
                      reason: config?.helper || prev.reason,
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {MOVEMENT_TYPES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Direction</Label>
                  <select
                    value={movementForm.direction}
                    onChange={event => setMovementForm(prev => ({ ...prev, direction: event.target.value as 'in' | 'out' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="in">Inbound</option>
                    <option value="out">Outbound</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={movementForm.quantity}
                    onChange={event => setMovementForm(prev => ({ ...prev, quantity: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Lot</Label>
                <select
                  value={movementForm.lotId}
                  onChange={event => setMovementForm(prev => ({ ...prev, lotId: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All lots</option>
                  {selectedItem?.lots?.map(lot => (
                    <option key={lot.id} value={lot.id}>
                      {lot.lotNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Source location</Label>
                  <Input
                    value={movementForm.sourceLocationId}
                    onChange={event => setMovementForm(prev => ({ ...prev, sourceLocationId: event.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Destination location</Label>
                  <Input
                    value={movementForm.destinationLocationId}
                    onChange={event => setMovementForm(prev => ({ ...prev, destinationLocationId: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Reason</Label>
                <Input
                  value={movementForm.reason}
                  onChange={event => setMovementForm(prev => ({ ...prev, reason: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  value={movementForm.notes}
                  onChange={event => setMovementForm(prev => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Unit cost</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={movementForm.unitCost}
                  onChange={event => setMovementForm(prev => ({ ...prev, unitCost: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowMovementSheet(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Log movement
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Supplier Sheet */}
      <Sheet open={showSupplierSheet} onOpenChange={setShowSupplierSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add supplier</SheetTitle>
            <SheetDescription>Keep a registry of vendors for clinical and purchasing traceability.</SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-6" onSubmit={handleCreateSupplier}>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Supplier name *</Label>
                <Input
                  required
                  value={supplierForm.name}
                  onChange={event => setSupplierForm(prev => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Vendor code</Label>
                <Input
                  value={supplierForm.code}
                  onChange={event => setSupplierForm(prev => ({ ...prev, code: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact name</Label>
                  <Input
                    value={supplierForm.contactName}
                    onChange={event => setSupplierForm(prev => ({ ...prev, contactName: event.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact phone</Label>
                  <Input
                    value={supplierForm.contactPhone}
                    onChange={event => setSupplierForm(prev => ({ ...prev, contactPhone: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact email</Label>
                <Input
                  type="email"
                  value={supplierForm.contactEmail}
                  onChange={event => setSupplierForm(prev => ({ ...prev, contactEmail: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  value={supplierForm.notes}
                  onChange={event => setSupplierForm(prev => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowSupplierSheet(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save supplier
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Category Sheet */}
      <Sheet open={showCategorySheet} onOpenChange={setShowCategorySheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create category</SheetTitle>
            <SheetDescription>Group inventory items by clinical function or storage area.</SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-6" onSubmit={handleCreateCategory}>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Category name *</Label>
                <Input
                  required
                  value={categoryForm.name}
                  onChange={event => setCategoryForm(prev => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <textarea
                  value={categoryForm.description}
                  onChange={event => setCategoryForm(prev => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Checkbox
                  checked={categoryForm.isActive}
                  onCheckedChange={checked => setCategoryForm(prev => ({ ...prev, isActive: Boolean(checked) }))}
                />
                Category is active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowCategorySheet(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save category
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

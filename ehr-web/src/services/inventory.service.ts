import { InventoryCategory, InventoryItem, InventoryLot, InventoryOverview, InventorySupplier, StockMovement } from '@/types/inventory'

type ItemFilters = {
  search?: string
  categoryId?: string
  locationId?: string
  includeInactive?: boolean
  controlledOnly?: boolean
  limit?: number
  offset?: number
}

type LotFilters = {
  itemId?: string
  locationId?: string
  status?: string
  expiringWithinDays?: number
  search?: string
  limit?: number
  offset?: number
}

type MovementFilters = {
  itemId?: string
  lotId?: string
  movementType?: string
  direction?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class InventoryApiService {
  private getHeaders(orgId: string, userId?: string) {
    const headers: Record<string, string> = {
      'x-org-id': orgId,
    }

    if (userId) {
      headers['x-user-id'] = userId
    }

    return headers
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value))
        }
      })
    }

    const base = API_BASE.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const queryString = searchParams.toString()
    const basePath = `${base}/api/inventory${normalizedPath}`

    if (queryString) {
      return `${basePath}?${queryString}`
    }

    return basePath
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Inventory request failed'
      try {
        const body = await response.json()
        errorMessage = body.error || body.message || errorMessage
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage)
    }

    return response.json() as Promise<T>
  }

  async getOverview(orgId: string, userId?: string, params?: { locationId?: string; daysToExpire?: number }): Promise<InventoryOverview> {
    const url = this.buildUrl('/dashboard/overview', {
      locationId: params?.locationId,
      daysToExpire: params?.daysToExpire,
    })

    const response = await fetch(url, {
      headers: this.getHeaders(orgId, userId),
    })

    const data = await this.handleResponse<{ overview: InventoryOverview }>(response)
    return data.overview
  }

  async listCategories(orgId: string, userId?: string): Promise<InventoryCategory[]> {
    const response = await fetch(this.buildUrl('/categories'), {
      headers: this.getHeaders(orgId, userId),
    })

    const data = await this.handleResponse<{ categories: InventoryCategory[] }>(response)
    return data.categories
  }

  async createCategory(orgId: string, userId: string | undefined, payload: Partial<InventoryCategory>): Promise<InventoryCategory> {
    const response = await fetch(this.buildUrl('/categories'), {
      method: 'POST',
      headers: {
        ...this.getHeaders(orgId, userId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await this.handleResponse<{ category: InventoryCategory }>(response)
    return data.category
  }

  async listSuppliers(orgId: string, userId?: string): Promise<InventorySupplier[]> {
    const response = await fetch(this.buildUrl('/suppliers'), {
      headers: this.getHeaders(orgId, userId),
    })

    const data = await this.handleResponse<{ suppliers: InventorySupplier[] }>(response)
    return data.suppliers
  }

  async createSupplier(orgId: string, userId: string | undefined, payload: Partial<InventorySupplier>): Promise<InventorySupplier> {
    const response = await fetch(this.buildUrl('/suppliers'), {
      method: 'POST',
      headers: {
        ...this.getHeaders(orgId, userId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await this.handleResponse<{ supplier: InventorySupplier }>(response)
    return data.supplier
  }

  async listItems(orgId: string, userId: string | undefined, filters: ItemFilters = {}): Promise<InventoryItem[]> {
    const response = await fetch(
      this.buildUrl('/items', {
        search: filters.search,
        categoryId: filters.categoryId,
        locationId: filters.locationId,
        includeInactive: filters.includeInactive,
        controlledOnly: filters.controlledOnly,
        limit: filters.limit,
        offset: filters.offset,
      }),
      {
        headers: this.getHeaders(orgId, userId),
      }
    )

    const data = await this.handleResponse<{ items: InventoryItem[] }>(response)
    return data.items
  }

  async getItem(orgId: string, userId: string | undefined, itemId: string): Promise<InventoryItem> {
    const response = await fetch(this.buildUrl(`/items/${itemId}`), {
      headers: this.getHeaders(orgId, userId),
    })

    const data = await this.handleResponse<{ item: InventoryItem }>(response)
    return data.item
  }

  async createItem(orgId: string, userId: string | undefined, payload: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetch(this.buildUrl('/items'), {
      method: 'POST',
      headers: {
        ...this.getHeaders(orgId, userId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await this.handleResponse<{ item: InventoryItem }>(response)
    return data.item
  }

  async listLots(orgId: string, userId: string | undefined, filters: LotFilters = {}): Promise<InventoryLot[]> {
    const response = await fetch(
      this.buildUrl('/lots', {
        itemId: filters.itemId,
        locationId: filters.locationId,
        status: filters.status,
        expiringWithinDays: filters.expiringWithinDays,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
      }),
      {
        headers: this.getHeaders(orgId, userId),
      }
    )

    const data = await this.handleResponse<{ lots: InventoryLot[] }>(response)
    return data.lots
  }

  async createLot(orgId: string, userId: string | undefined, itemId: string, payload: Partial<InventoryLot> & { quantityOnHand?: number; unitCost?: number; reason?: string }): Promise<InventoryLot> {
    const response = await fetch(this.buildUrl(`/items/${itemId}/lots`), {
      method: 'POST',
      headers: {
        ...this.getHeaders(orgId, userId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await this.handleResponse<{ lot: InventoryLot }>(response)
    return data.lot
  }

  async listStockMovements(orgId: string, userId: string | undefined, filters: MovementFilters = {}): Promise<StockMovement[]> {
    const response = await fetch(
      this.buildUrl('/stock-movements', {
        itemId: filters.itemId,
        lotId: filters.lotId,
        movementType: filters.movementType,
        direction: filters.direction,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
        offset: filters.offset,
      }),
      {
        headers: this.getHeaders(orgId, userId),
      }
    )

    const data = await this.handleResponse<{ movements: StockMovement[] }>(response)
    return data.movements
  }

  async recordStockMovement(orgId: string, userId: string | undefined, payload: {
    itemId: string
    lotId?: string
    quantity: number
    movementType: string
    direction: 'in' | 'out'
    sourceLocationId?: string
    destinationLocationId?: string
    reason?: string
    notes?: string
    unitCost?: number
  }): Promise<StockMovement> {
    const response = await fetch(this.buildUrl('/stock-movements'), {
      method: 'POST',
      headers: {
        ...this.getHeaders(orgId, userId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await this.handleResponse<{ movement: StockMovement }>(response)
    return data.movement
  }
}

export const inventoryApi = new InventoryApiService()

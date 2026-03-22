import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Search, Trash2 } from 'lucide-react'
import { useWarehouses } from '@/hooks/use-warehouses'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SelectMyProductDialog } from '@/features/orders/components/select-my-product-dialog'
import { SelectStoreProductDialog } from '@/features/orders/components/select-store-product-dialog'
import { addStock } from '@/lib/api/orders'

const route = getRouteApi('/_authenticated/stock-orders/buy-stock')

type EditableProductRow = {
  key: string
  skuId: string
  productName: string
  productVariant: string
  quantity: number
}

export function BuyStockPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [isSelectMyProductOpen, setIsSelectMyProductOpen] = useState(false)
  const [isSelectStoreProductOpen, setIsSelectStoreProductOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<EditableProductRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateRow = (
    rowKey: string,
    field: keyof Omit<EditableProductRow, 'key'>,
    value: string | number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((row) =>
        row.key === rowKey ? { ...row, [field]: value } : row
      )
    )
  }

  const removeRow = (rowKey: string) => {
    setSelectedProducts((prev) => prev.filter((row) => row.key !== rowKey))
  }

  useEffect(() => {
    if (!selectedWarehouseId && warehouses.length > 0) {
      setSelectedWarehouseId(warehouses[0].value)
    }
  }, [selectedWarehouseId, warehouses])

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>
      <Main fluid>
        <div className='space-y-4 px-4 py-3'>
          <div className='flex items-center gap-4 rounded-xl border bg-card p-4'>
            <div className='text-muted-foreground shrink-0 text-2xl font-medium'>
              Shipping Address
            </div>
            <div className='w-full max-w-md'>
              <Select
                value={selectedWarehouseId}
                onValueChange={setSelectedWarehouseId}
                disabled={isLoadingWarehouses}
              >
                <SelectTrigger className='h-11'>
                  <SelectValue
                    placeholder={
                      isLoadingWarehouses
                        ? 'Loading warehouses...'
                        : 'Select warehouse'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.length === 0 ? (
                    <SelectItem value='__no_warehouse__' disabled>
                      No warehouses available
                    </SelectItem>
                  ) : (
                    warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.value} value={warehouse.value}>
                        {warehouse.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='rounded-xl border bg-card p-4'>
            <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
              <div className='text-xl font-semibold'>Product Info</div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  className='h-10'
                  onClick={() => setIsSelectMyProductOpen(true)}
                >
                  <Search className='mr-2 h-4 w-4' />
                  Collection Products
                </Button>
                <Button
                  variant='outline'
                  className='h-10'
                  onClick={() => setIsSelectStoreProductOpen(true)}
                >
                  <Search className='mr-2 h-4 w-4' />
                  Select My Store Product
                </Button>
              </div>
            </div>

            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/40'>
                    <TableHead>Product Name*</TableHead>
                    <TableHead>Product Variants</TableHead>
                    <TableHead>Quantity*</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.length > 0 ? (
                    selectedProducts.map((item) => (
                      <TableRow key={item.key}>
                        <TableCell className='text-sm font-medium'>
                          <Input
                            value={item.productName}
                            onChange={(e) =>
                              updateRow(item.key, 'productName', e.target.value)
                            }
                            className='h-9 max-w-[260px]'
                            title={item.productName}
                          />
                        </TableCell>
                        <TableCell className='text-sm'>
                          <Input
                            value={item.productVariant}
                            onChange={(e) =>
                              updateRow(item.key, 'productVariant', e.target.value)
                            }
                            className='h-9'
                            title={item.productVariant}
                          />
                        </TableCell>
                        <TableCell className='text-sm'>
                          <Input
                            type='number'
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const next = Number(e.target.value)
                              updateRow(
                                item.key,
                                'quantity',
                                Number.isNaN(next) || next <= 0 ? 1 : next
                              )
                            }}
                            className='h-9 w-24'
                          />
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeRow(item.key)}
                            aria-label='Remove'
                          >
                            
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className='text-muted-foreground' colSpan={4}>
                        {search.orderId
                          ? `Create Buy Stock from order: ${search.orderId}`
                          : 'Please select product information.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 z-10 border-t bg-background px-4 py-3 text-right'>
          <Button
            className='min-w-[120px]'
            disabled={
              isSubmitting ||
              !selectedWarehouseId ||
              selectedProducts.length === 0
            }
            onClick={async () => {
              const customerId = auth.user?.customerId
              if (!customerId) {
                toast.error('Customer ID not found')
                return
              }
              if (!selectedWarehouseId) {
                toast.error('Please select a warehouse')
                return
              }
              const stockItems = selectedProducts
                .map((p) => ({
                  skuId: String(p.skuId || '').trim(),
                  qty: Number(p.quantity) > 0 ? Number(p.quantity) : 1,
                }))
                .filter((x) => x.skuId.length > 0 && x.qty > 0)
              if (stockItems.length === 0) {
                toast.error('Please add at least one valid item')
                return
              }
              setIsSubmitting(true)
              try {
                await addStock({
                  stockType: '1',
                  stockItems,
                  warehouseId: String(selectedWarehouseId),
                  customerId: String(customerId),
                })
                toast.success('Submitted successfully')
                void navigate({ to: '/stock-orders' })
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to submit. Please try again.'
                )
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </Button>
        </div>

        <SelectMyProductDialog
          open={isSelectMyProductOpen}
          onOpenChange={setIsSelectMyProductOpen}
          onSelect={(products) => {
            const rows = (products as Record<string, unknown>[]).map((p, idx) => ({
              key: String(p.id ?? p.skuId ?? p.number ?? `row-${idx}`),
              skuId: String(p.id ?? p.skuId ?? ''),
              productName: String(p.spuName ?? p.name ?? ''),
              productVariant: String(p.number ?? p.skuCode ?? ''),
              quantity: 1,
            }))
            setSelectedProducts((prev) => {
              const existing = new Set(prev.map((r) => r.key))
              const additions = rows.filter((r) => !existing.has(r.key))
              return [...prev, ...additions]
            })
          }}
        />
        <SelectStoreProductDialog
          open={isSelectStoreProductOpen}
          onOpenChange={setIsSelectStoreProductOpen}
          onSelect={(items) => {
            const rows = (items as Record<string, unknown>[]).map((item, idx) => ({
              key: String(item.skuNumber ?? item.id ?? `store-${idx}`),
              skuId: String(item.id ?? item.skuId ?? ''),
              productName: String(item.skuCName ?? ''),
              productVariant: String(item.skuNumber ?? ''),
              quantity: 1,
            }))
            setSelectedProducts((prev) => {
              const existing = new Set(prev.map((r) => r.key))
              const additions = rows.filter((r) => !existing.has(r.key))
              return [...prev, ...additions]
            })
          }}
        />
      </Main>
    </>
  )
}

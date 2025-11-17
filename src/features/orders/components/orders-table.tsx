import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Image as ImageIcon } from 'lucide-react'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { orderStatuses } from '../data/data'
import { type Order, type OrderProduct } from '../data/schema'
import { createOrdersColumns } from './orders-columns'
import { OrdersEditAddressDialog } from './orders-edit-address-dialog'
import { OrdersModifyProductDialog } from './orders-modify-product-dialog'
import { OrdersTableFooter } from './orders-table-footer'

const route = getRouteApi('/_authenticated/orders/')

type DataTableProps = {
  data: Order[]
}

// Product detail row component
function ProductDetailRow({
  product,
  onModify,
}: {
  product: OrderProduct
  onModify: (product: OrderProduct) => void
}) {
  const variantText =
    product.productVariant?.map((v) => `${v.name}: ${v.value}`).join(', ') ||
    '---'

  // Define cell configurations
  const cellConfigs = [
    {
      colSpan: 2,
      content: (
        <div className='flex items-center gap-6'>
          {product.productImageUrl ? (
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className='h-16 w-16 rounded object-cover'
            />
          ) : (
            <div className='bg-muted flex h-16 w-16 items-center justify-center rounded'>
              <ImageIcon className='text-muted-foreground h-8 w-8' />
            </div>
          )}
          <div className='flex-1 space-y-2'>
            <div className='flex items-center gap-3'>
              <span className='text-xs font-medium'>Store</span>
              <span className='text-xs font-medium'>HZ</span>
            </div>
            <div className='text-sm leading-relaxed'>Title: ---</div>
            <div className='text-sm leading-relaxed'>
              Title: {product.productName}
            </div>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className='space-y-1 text-sm'>
          <div>SKU: ---</div>
          <div>SKU: {product.id}</div>
        </div>
      ),
    },
    {
      content: (
        <div className='space-y-1 text-sm'>
          <div>Variant: ---</div>
          <div>Variant: {variantText}</div>
        </div>
      ),
    },
    {
      content: (
        <div className='space-y-1 text-sm'>
          <div>Price: ---</div>
          <div>Price: ${product.price.toFixed(2)}</div>
        </div>
      ),
    },
    {
      content: (
        <div className='space-y-1 text-sm'>
          <div>Quantity: {product.quantity}</div>
          <div>Quantity: {product.quantity}</div>
        </div>
      ),
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: <div className='text-sm'>---</div>,
    },
    {
      content: (
        <div className='flex flex-col gap-1'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={(e) => {
              e.stopPropagation()
              onModify(product)
            }}
          >
            Modify Product
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Add Package
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <TableRow className='bg-muted/30'>
      {cellConfigs.map((config, index) => (
        <TableCell key={index} colSpan={config.colSpan} className='p-4'>
          {config.content}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function OrdersTable({ data }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    platformOrderStatus: false,
    platformFulfillmentStatus: false,
    store: false,
    logistics: false,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [modifyProductDialog, setModifyProductDialog] = useState<{
    open: boolean
    products: OrderProduct[]
    orderId: string
  }>({
    open: false,
    products: [],
    orderId: '',
  })
  const [editAddressDialog, setEditAddressDialog] = useState<{
    open: boolean
    order: Order | null
  }>({
    open: false,
    order: null,
  })

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      {
        columnId: 'platformOrderStatus',
        searchKey: 'platformOrderStatus',
        type: 'array',
      },
      {
        columnId: 'platformFulfillmentStatus',
        searchKey: 'platformFulfillmentStatus',
        type: 'array',
      },
      { columnId: 'store', searchKey: 'store', type: 'array' },
      { columnId: 'logistics', searchKey: 'logistics', type: 'array' },
      {
        columnId: 'shippingOrigin',
        searchKey: 'shippingOrigin',
        type: 'array',
      },
    ],
  })

  // Filter data based on active tab
  const filteredData = data.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const handleExpand = (rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  const handleModifyProduct = (_product: OrderProduct, orderId: string) => {
    // Find the order from the original data, not filtered data
    const order = data.find((o) => o.id === orderId)
    if (order && order.productList && order.productList.length > 0) {
      console.log(
        'Opening modify product dialog for order:',
        orderId,
        order.productList
      )
      setModifyProductDialog({
        open: true,
        products: order.productList,
        orderId,
      })
    } else {
      console.warn('Order not found or has no products:', orderId, {
        found: !!order,
        hasProducts: order?.productList ? order.productList.length > 0 : false,
      })
    }
  }

  const handleConfirmModify = (updatedProducts: OrderProduct[]) => {
    // Update the order's product list
    // In a real app, this would make an API call
    console.log(
      'Updated products for order:',
      modifyProductDialog.orderId,
      updatedProducts
    )
    // TODO: Update the order in the data
    setModifyProductDialog({ open: false, products: [], orderId: '' })
  }

  const handleEditAddress = (orderId: string) => {
    const order = data.find((o) => o.id === orderId)
    if (order) {
      setEditAddressDialog({
        open: true,
        order,
      })
    }
  }

  const handleConfirmEditAddress = (addressData: {
    customerName: string
    address: string
    address2?: string
    city: string
    country: string
    province?: string
    postalCode: string
    phoneNumber: string
    email?: string
    shippingOrigin: string
  }) => {
    // Update the order's address
    // In a real app, this would make an API call
    console.log(
      'Updated address for order:',
      editAddressDialog.order?.id,
      addressData
    )
    // TODO: Update the order in the data
    setEditAddressDialog({ open: false, order: null })
  }

  const columns = useMemo(
    () =>
      createOrdersColumns({
        onExpand: handleExpand,
        expandedRows,
        selectedOrderId,
        onSelectOrder: setSelectedOrderId,
        onModifyProduct: (orderId) => {
          const order = data.find((o) => o.id === orderId)
          if (order && order.productList && order.productList.length > 0) {
            setModifyProductDialog({
              open: true,
              products: order.productList,
              orderId,
            })
          } else {
            // If no products, use fake data
            setModifyProductDialog({
              open: true,
              products: [],
              orderId,
            })
          }
        },
        onEditAddress: handleEditAddress,
      }),
    [expandedRows, selectedOrderId, data]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const orderNumber = String(row.getValue('orderNumber')).toLowerCase()
      const customerName = String(row.getValue('customerName')).toLowerCase()
      const country = String(row.getValue('country')).toLowerCase()
      const province = String(row.getValue('province')).toLowerCase()
      const city = String(row.getValue('city')).toLowerCase()
      const phoneNumber = String(row.getValue('phoneNumber')).toLowerCase()
      const email = String(row.getValue('email')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue) ||
        country.includes(searchValue) ||
        province.includes(searchValue) ||
        city.includes(searchValue) ||
        phoneNumber.includes(searchValue) ||
        email.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-9'>
          {orderStatuses.map((status) => (
            <TabsTrigger key={status.value} value={status.value}>
              {status.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4'>
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : typeof header.column
                              .columnDef.header === 'string' ? (
                            <div className='whitespace-pre-line'>
                              {header.column.columnDef.header}
                            </div>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const order = row.original
                    const isExpanded = expandedRows.has(row.id)
                    const hasProducts =
                      order.productList && order.productList.length > 0

                    return (
                      <>
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && hasProducts && (
                          <>
                            {order.productList.map((product) => (
                              <ProductDetailRow
                                key={product.id}
                                product={product}
                                onModify={(p) =>
                                  handleModifyProduct(p, order.id)
                                }
                              />
                            ))}
                          </>
                        )}
                      </>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <OrdersTableFooter table={table} />
        </TabsContent>
      </Tabs>

      {/* Modify Product Dialog */}
      <OrdersModifyProductDialog
        open={
          modifyProductDialog.open && modifyProductDialog.products.length > 0
        }
        onOpenChange={(open) => {
          if (!open) {
            setModifyProductDialog({ open: false, products: [], orderId: '' })
          } else {
            setModifyProductDialog({ ...modifyProductDialog, open })
          }
        }}
        products={modifyProductDialog.products}
        onConfirm={handleConfirmModify}
      />

      <OrdersEditAddressDialog
        open={editAddressDialog.open}
        onOpenChange={(open) =>
          setEditAddressDialog({ ...editAddressDialog, open })
        }
        order={editAddressDialog.order}
        onConfirm={handleConfirmEditAddress}
      />
    </div>
  )
}

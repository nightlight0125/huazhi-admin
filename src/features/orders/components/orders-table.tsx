import React, { useEffect, useMemo, useState } from 'react'
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
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createOrdersColumns } from './orders-columns'
import { OrdersEditAddressDialog } from './orders-edit-address-dialog'
import { OrdersModifyProductDialog } from './orders-modify-product-dialog'
import { OrdersTableFooter } from './orders-table-footer'

const route = getRouteApi('/_authenticated/orders/')

type DataTableProps = {
  data: Order[]
  onTableReady?: (table: ReturnType<typeof useReactTable<Order>>) => void
}

function ProductDetailRow({ product }: { product: OrderProduct }) {
  const variantText =
    product.productVariant?.map((v) => `${v.name}: ${v.value}`).join(', ') ||
    '---';

  // Define cell configurations matching the table columns
  const cellConfigs = [
    {
      // Store Name column - shows product image and Store HZ buttons
      content: (
        <div className='flex items-center gap-3'>
          {product.productImageUrl ? (
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className='h-12 w-12 rounded object-cover'
            />
          ) : (
            <div className='bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded'>
              <ImageIcon className='text-muted-foreground h-6 w-6' />
            </div>
          )}
          <div className='flex flex-col gap-1'>
            <Button variant='outline' size='sm' className='h-5 w-10 text-[12px]'>
              Store
            </Button>
            <Button variant='outline' size='sm' className='h-5 w-10 text-[12px]'>
              HZ
            </Button>
          </div>
        </div>
      ),
    },
    {
      // Store Order Number / HZ Order Number - shows Title
      content: (
        <div style={{ marginTop: '4px'}} className='space-y-1 text-[12px] min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <div>Title: ---</div>
          <div className='break-words' style={{ marginTop: '8px'}}>Title: {product.productName}</div>
        </div>
      ),
    },
    {
      // Store Order Time / HZ Order Time - shows SKU
      content: (
        <div style={{ marginTop: '4px'}} className='space-y-1 text-[12px] min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <div>SKU: ---</div>
          <div className='break-words' style={{ marginTop: '8px'}}>SKU: {product.id}</div>
        </div>
      ),
    },
    {
      // Cost - shows Variant
      content: (
        <div style={{ marginTop: '4px'}} className='space-y-1 text-[12px] min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <div>Variant: ---</div>
          <div className='break-words' style={{ marginTop: '8px'}}>Variant: {variantText}</div>
        </div>
      ),
    },
    {
      // Customer - shows Price
      content: (
        <div style={{ marginTop: '4px'}} className='space-y-1 text-[12px] min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <div>Price: ---</div>
          <div style={{ marginTop: '8px'}}>Price: ${product.price.toFixed(2)}</div>
        </div>
      ),
    },
    {
      // Shipping Track ID - shows Quantity, Variant ID, Weight
      content: (
        <div style={{ marginTop: '4px'}} className='space-y-1 text-[12px] min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <div>Quantity: {product.quantity}</div>
          <div style={{ marginTop: '8px'}}>Quantity: {product.quantity}</div>
        </div>
      ),
    },
    {
      // Action buttons column
      content: (
        <div style={{ marginTop: '4px'}} className='flex flex-col gap-1 min-w-[30px] overflow-hidden break-words whitespace-pre-line'>
          <Button variant='outline' size='sm' className='h-6 text-[12px]'>
            Modify Product
          </Button>
          <Button variant='outline' size='sm' className='h-6 text-[12px]'>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TableRow className='bg-muted/30'>
      {/* 让展开行内容占据整一行宽度 */}
      <TableCell colSpan={100} className='px-3 py-2'>
        <div className='flex flex-wrap items-start gap-x-4 gap-y-2 text-[12px]'>
          {cellConfigs.map((config, index) => (
            <div key={index} className='flex-shrink-0'>
              {config.content}
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function OrdersTable({ data, onTableReady }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    platformOrderStatus: false,
    platformFulfillmentStatus: false,
    store: false,
    logistics: false,
    country: false,
    status: false,
    shippingOrigin: false,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
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
    [expandedRows, data]
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

  // Notify parent component when table is ready
  useEffect(() => {
    if (onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

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
                      <React.Fragment key={row.id}>
                        <TableRow
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
                              />
                            ))}
                          </>
                        )}
                      </React.Fragment>
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

      <DataTableBulkActions table={table} />

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

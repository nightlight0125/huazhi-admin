import { useEffect, useState } from 'react'
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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar, DataTableBulkActions } from '@/components/data-table'
import { shippingFromOptions, shippingMethodsByCountry } from '../data/data'
import { type ProductConnection } from '../data/schema'
import { createProductConnectionsColumns } from './product-connections-columns-with-handlers'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ShippingFromDialog } from './shipping-from-dialog'
import { ShippingMethodDialog } from './shipping-method-dialog'

const route = getRouteApi('/_authenticated/product-connections/')

type DataTableProps = {
  data: ProductConnection[]
}

export function ProductConnectionsTable({ data }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  
  // Dialog states
  const [shippingFromDialogOpen, setShippingFromDialogOpen] = useState(false)
  const [shippingMethodDialogOpen, setShippingMethodDialogOpen] = useState(false)
  const [selectedProductConnection, setSelectedProductConnection] = useState<ProductConnection | null>(null)

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
      { columnId: 'shippingFrom', searchKey: 'shippingFrom', type: 'array' },
      { columnId: 'shippingMethod', searchKey: 'shippingMethod', type: 'array' },
    ],
  })

  // Dialog handlers
  const handleShippingFromClick = (productConnection: ProductConnection) => {
    setSelectedProductConnection(productConnection)
    setShippingFromDialogOpen(true)
  }

  const handleShippingMethodClick = (productConnection: ProductConnection) => {
    setSelectedProductConnection(productConnection)
    setShippingMethodDialogOpen(true)
  }

  const handleShippingFromSave = (productId: string, newShippingFrom: string) => {
    console.log('更新发货地:', productId, newShippingFrom)
    // 这里可以添加实际的更新逻辑
    alert(`产品 ${productId} 的发货地已更新为: ${newShippingFrom}`)
  }

  const handleShippingMethodSave = (productId: string, newShippingMethod: string, newShippingCost: number) => {
    console.log('更新装运方式:', productId, newShippingMethod, newShippingCost)
    // 这里可以添加实际的更新逻辑
    alert(`产品 ${productId} 的装运方式已更新为: ${newShippingMethod}，运费: $${newShippingCost.toFixed(2)}`)
  }

  const handleBrandCustomizationClick = (productConnection: ProductConnection) => {
    console.log('打开品牌定制对话框:', productConnection)
    // 这里应该打开品牌定制对话框
    alert(`打开产品 ${productConnection.id} 的品牌定制对话框`)
  }


  // Create columns with handlers
  const columns = createProductConnectionsColumns({
    onShippingFromClick: handleShippingFromClick,
    onShippingMethodClick: handleShippingMethodClick,
    onBrandCustomizationClick: handleBrandCustomizationClick,
  })

  // Create shipping method filter options from all available methods
  const shippingMethodOptions = Object.values(shippingMethodsByCountry)
    .flat()
    .map(method => ({
      value: method.id,
      label: method.name,
    }))
    .filter((method, index, self) => 
      index === self.findIndex(m => m.value === method.value)
    )

  const table = useReactTable({
    data,
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
      const id = String(row.getValue('id')).toLowerCase()
      const productName = String(row.getValue('productName')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || productName.includes(searchValue)
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
      <DataTableToolbar
        table={table}
        searchPlaceholder='按产品名称或ID搜索...'
        filters={[
          {
            columnId: 'shippingFrom',
            title: '发货地',
            options: shippingFromOptions,
          },
          {
            columnId: 'shippingMethod',
            title: '装运方式',
            options: shippingMethodOptions,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
              ))
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
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} entityName="产品连接">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const selectedProducts = selectedRows.map(row => row.original as ProductConnection)
            console.log('批量删除产品连接:', selectedProducts)
            alert(`已删除 ${selectedProducts.length} 个产品连接`)
            table.resetRowSelection()
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除选中项
        </Button>
      </DataTableBulkActions>

      {/* Dialogs */}
      <ShippingFromDialog
        open={shippingFromDialogOpen}
        onOpenChange={setShippingFromDialogOpen}
        productConnection={selectedProductConnection}
        onSave={handleShippingFromSave}
      />
      
      <ShippingMethodDialog
        open={shippingMethodDialogOpen}
        onOpenChange={setShippingMethodDialogOpen}
        productConnection={selectedProductConnection}
        onSave={handleShippingMethodSave}
      />

    </div>
  )
}

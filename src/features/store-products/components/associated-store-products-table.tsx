import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Link2, Minus, Plus, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type StoreProduct } from '../data/schema'
import { AssociatedBulkActions } from './associated-bulk-actions'

interface AssociatedStoreProductsTableProps {
  data: StoreProduct[]
}

export function AssociatedStoreProductsTable({
  data,
}: AssociatedStoreProductsTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [disconnectProductId, setDisconnectProductId] = useState<string | null>(
    null
  )
  const [expandedStoreNames, setExpandedStoreNames] = useState<Set<string>>(
    new Set()
  )

  // 按店铺分组数据
  const groupedByStore = useMemo(() => {
    const groups = new Map<string, StoreProduct[]>()
    data.forEach((item) => {
      const storeName = item.storeName
      if (!groups.has(storeName)) {
        groups.set(storeName, [])
      }
      groups.get(storeName)!.push(item)
    })
    return groups
  }, [data])

  // 获取展开后的扁平数据
  const flattenedData = useMemo(() => {
    const result: StoreProduct[] = []
    groupedByStore.forEach((products, storeName) => {
      if (expandedStoreNames.has(storeName)) {
        // 展开的店铺：显示所有产品
        result.push(...products)
      } else {
        // 折叠的店铺：只显示第一个产品
        if (products.length > 0) {
          result.push(products[0])
        }
      }
    })
    return result
  }, [groupedByStore, expandedStoreNames])

  // 获取选中的产品 ID
  const selectedIds = useMemo(() => {
    return new Set(
      Object.keys(rowSelection)
        .map((index) => flattenedData[Number(index)]?.id)
        .filter(Boolean)
    )
  }, [rowSelection, flattenedData])

  // 清除所有选中
  const handleClearSelection = () => {
    setRowSelection({})
  }

  // 处理断开连接
  const handleDisconnect = (productId: string) => {
    setDisconnectProductId(productId)
  }

  const handleConfirmDisconnect = () => {
    if (disconnectProductId) {
      // TODO: 实现断开连接逻辑
      console.log('Disconnect product:', disconnectProductId)
      setDisconnectProductId(null)
    }
  }

  // 切换店铺展开/折叠
  const handleToggleStoreExpand = (storeName: string) => {
    const newExpanded = new Set(expandedStoreNames)
    if (newExpanded.has(storeName)) {
      newExpanded.delete(storeName)
    } else {
      newExpanded.add(storeName)
    }
    setExpandedStoreNames(newExpanded)
  }

  // 判断是否是店铺的第一个产品
  const isFirstProductOfStore = (product: StoreProduct) => {
    const storeName = product.storeName
    const storeProducts = groupedByStore.get(storeName) || []
    return storeProducts[0]?.id === product.id
  }

  // 创建列定义
  const columns = useMemo<ColumnDef<StoreProduct>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'storeName',
        header: 'Store Name',
        cell: ({ row }) => {
          const item = row.original
          const isFirst = isFirstProductOfStore(item)
          return (
            <div className='flex items-center gap-2'>
              {isFirst && (
                <button
                  onClick={() => handleToggleStoreExpand(item.storeName)}
                  className='flex h-5 w-5 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'
                  aria-label={`${expandedStoreNames.has(item.storeName) ? 'Collapse' : 'Expand'} ${item.storeName}`}
                >
                  {expandedStoreNames.has(item.storeName) ? (
                    <Minus className='h-3.5 w-3.5' />
                  ) : (
                    <Plus className='h-3.5 w-3.5' />
                  )}
                </button>
              )}
              <span className='text-green-600'>$</span>
              <span>{item.storeName}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Store Product',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex items-center gap-3'>
              <img
                src={item.image}
                alt={item.name}
                className='h-16 w-16 shrink-0 rounded object-cover'
              />
              <div className='flex flex-col gap-1'>
                <div className='text-sm font-medium'>{item.name}</div>
                <div className='text-muted-foreground text-xs'>
                  Product ID: {item.id}
                </div>
                <div className='text-muted-foreground text-xs'>
                  Price: ${item.storePrice.toFixed(2)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: 'disconnect',
        header: '',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex justify-center'>
              <button
                onClick={() => handleDisconnect(item.id)}
                className='relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
                aria-label='Disconnect product'
              >
                <Link2 className='h-4 w-4 text-white' />
                <Sparkles className='absolute -top-1 -left-1 h-3 w-3 text-white' />
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'product',
        header: 'Product',
        cell: () => (
          <div className='flex items-center gap-3'>
            <div className='bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded object-cover'>
              <span className='text-muted-foreground text-xs'>POD</span>
            </div>
            <div className='flex flex-col gap-1'>
              <div className='text-sm font-medium'>—</div>
              <div className='text-muted-foreground text-xs'>TD SPU: ---</div>
              <div className='text-muted-foreground text-xs'>Price: $0.00</div>
            </div>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: () => <div className='text-muted-foreground text-xs'>---</div>,
      },
    ],
    [expandedStoreNames, groupedByStore]
  )

  const table = useReactTable({
    data: flattenedData,
    columns,
    state: {
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => row.id || String(index),
    globalFilterFn: (row, _columnId, filterValue) => {
      const item = row.original
      const searchLower = String(filterValue).toLowerCase()
      const nameMatch = item.name.toLowerCase().includes(searchLower)
      const idMatch = item.id.toLowerCase().includes(searchLower)
      const storeNameMatch = item.storeName.toLowerCase().includes(searchLower)
      return nameMatch || idMatch || storeNameMatch
    },
  })

  // 展开/折叠时重置分页
  useEffect(() => {
    table.setPageIndex(0)
  }, [expandedStoreNames, table])

  return (
    <div className='space-y-4'>
      <AssociatedBulkActions
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
      />
      <DataTableToolbar
        table={table}
        searchPlaceholder='enter store product\name\ID'
        searchKey='name'
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='text-xs font-medium'
                    style={{
                      width:
                        header.id === 'select'
                          ? '40px'
                          : header.id === 'storeName'
                            ? '160px'
                            : header.id === 'name'
                              ? '420px'
                              : header.id === 'disconnect'
                                ? '60px'
                                : header.id === 'product'
                                  ? '420px'
                                  : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='text-xs'
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <ConfirmDialog
        open={!!disconnectProductId}
        onOpenChange={(open) => {
          if (!open) {
            setDisconnectProductId(null)
          }
        }}
        title={
          <div className='flex items-center gap-2'>
            <span>Please Confirm if You Need to Disconnect</span>
          </div>
        }
        desc='Are you sure you want to disconnect this product?'
        confirmText='Confirm'
        cancelBtnText='Cancel'
        handleConfirm={handleConfirmDisconnect}
      />
    </div>
  )
}

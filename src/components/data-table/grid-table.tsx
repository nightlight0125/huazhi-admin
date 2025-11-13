import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from './bulk-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

interface DataGridTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  searchPlaceholder?: string
  filters?: {
    columnId: string
    title: string
    options?: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
    categories?: CategoryItem[]
    useCategoryTree?: boolean
  }[]
  gridCols?: string
  // 路由配置
  routePath?: string
  // 自定义渲染配置
  renderConfig: {
    // 主标题字段
    titleField: keyof TData
    // 副标题字段（可选）
    subtitleField?: keyof TData
    // 标签字段配置
    badges?: {
      field: keyof TData
      title: string
      options: {
        label: string
        value: string
        icon?: React.ComponentType<{ className?: string }>
        variant?: 'default' | 'secondary' | 'destructive' | 'outline'
      }[]
    }[]
    // 日期字段配置
    dateFields?: {
      field: keyof TData
      label: string
      format?: string
    }[]
    // 描述字段
    descriptionField?: keyof TData
    // 行操作组件
    rowActions?: React.ComponentType<{ row: { original: TData } }>
    // 自定义渲染函数
    customRender?: (item: TData, isSelected: boolean, onSelect: (checked: boolean) => void) => React.ReactNode
  }
}

export function DataGridTable<TData>({
  data,
  columns,
  searchPlaceholder = '搜索...',
  filters = [],
  gridCols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  routePath = '/_authenticated/tasks/',
  renderConfig,
}: DataGridTableProps<TData>) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // 根据路由路径获取对应的路由
  const getRoute = () => {
    if (routePath === '/_authenticated/products/') {
      return getRouteApi('/_authenticated/products/')
    }
    return getRouteApi('/_authenticated/tasks/')
  }
  
  const route = getRoute()
  
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
    columnFilters: filters.map(filter => ({
      columnId: filter.columnId,
      searchKey: filter.columnId,
      type: 'array' as const,
    })),
  })

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
      const title = String(row.getValue('title')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || title.includes(searchValue)
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

  const renderGridItem = (item: TData, isSelected: boolean, onSelect: (checked: boolean) => void) => {
    // 如果提供了自定义渲染函数，优先使用
    if (renderConfig.customRender) {
      return renderConfig.customRender(item, isSelected, onSelect)
    }

    // 默认渲染逻辑
    const title = String(item[renderConfig.titleField] || '')
    const subtitle = renderConfig.subtitleField ? String(item[renderConfig.subtitleField] || '') : ''
    const description = renderConfig.descriptionField ? String(item[renderConfig.descriptionField] || '') : ''

    return (
      <Card className="group relative overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 text-sm font-medium">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="ml-2"
              />
              {renderConfig.rowActions && (
                <renderConfig.rowActions row={{ original: item }} />
              )}
            </div>
          </div>
          
          {subtitle && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{subtitle}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {/* 标签区域 */}
            {renderConfig.badges && renderConfig.badges.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-1">
                {renderConfig.badges.map((badgeConfig, index) => {
                  const value = String(item[badgeConfig.field] || '')
                  const option = badgeConfig.options.find(opt => opt.value === value)
                  
                  if (!option) return null
                  
                  return (
                    <Badge 
                      key={index}
                      variant={option.variant || 'outline'} 
                      className="text-xs"
                    >
                      {option.icon && <option.icon className="mr-1 h-3 w-3" />}
                      {option.label}
                    </Badge>
                  )
                })}
              </div>
            )}
            
            {/* 日期字段 */}
            {renderConfig.dateFields && renderConfig.dateFields.map((dateConfig, index) => {
              const dateValue = item[dateConfig.field]
              if (!dateValue) return null
              
              const date = dateValue instanceof Date ? dateValue : new Date(dateValue as string)
              
              return (
                <div key={index} className="text-xs text-muted-foreground">
                  {dateConfig.label}: {date.toLocaleDateString('zh-CN')}
                </div>
              )
            })}
            
            {/* 描述字段 */}
            {description && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
      />
      
      {/* 网格视图 */}
      <div className={`grid gap-4 ${gridCols}`}>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const isSelected = row.getIsSelected()
            const onSelect = (checked: boolean) => {
              row.toggleSelected(checked)
            }
            return (
              <div key={row.id}>
                {renderGridItem(row.original, isSelected, onSelect)}
              </div>
            )
          })
        ) : (
          <div className="col-span-full flex items-center justify-center h-24 text-muted-foreground">
            No results.
          </div>
        )}
      </div>
      
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} entityName="项目">
        <div className="text-sm text-muted-foreground">
          已选择 {table.getFilteredSelectedRowModel().rows.length} 个项目
        </div>
      </DataTableBulkActions>
    </div>
  )
}
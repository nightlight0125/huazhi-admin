import type React from 'react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Calendar as CalendarIcon, Search } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryTreeFacetedFilter } from './category-tree-faceted-filter'
import { DataTableFacetedFilter } from './faceted-filter'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  showSearch?: boolean
  showSearchButton?: boolean
  onSearch?: () => void
  /** 额外的搜索输入框（例如第二个搜索条件），只有外部传入时才展示 */
  extraSearch?: {
    columnId: string
    placeholder?: string
  }
  /** 第三个搜索输入框（例如仓库、店铺等），同样按列过滤，可选 */
  extraSearch2?: {
    columnId: string
    placeholder?: string
  }
  /** 第四个搜索输入框，同样按列过滤，可选 */
  extraSearch3?: {
    columnId: string
    placeholder?: string
  }
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
  dateRange?: {
    enabled?: boolean
    columnId?: string
    onDateRangeChange?: (dateRange: DateRange | undefined) => void
    placeholder?: string
  }
  bulkRevise?: {
    enabled?: boolean
    options?: {
      label: string
      value: string
    }[]
    placeholder?: string
    onApply?: (type: string, value: string) => void
  }
  /** 自定义筛选区域（例如两个输入框 + 日期选择器），会显示在 facets 之前 */
  customFilterSlot?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  showSearch = true,
  showSearchButton = true,
  onSearch,
  extraSearch,
  extraSearch2,
  extraSearch3,
  filters = [],
  dateRange,
  bulkRevise,
  customFilterSlot,
}: DataTableToolbarProps<TData>) {
  const [dateRangeValue, setDateRangeValue] = useState<DateRange | undefined>(
    undefined
  )
  const [bulkReviseType, setBulkReviseType] = useState<string>('price-change')
  const [bulkReviseValue, setBulkReviseValue] = useState<string>('')

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    table.getState().globalFilter ||
    (dateRange?.enabled && dateRangeValue)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRangeValue(range)
    if (dateRange?.onDateRangeChange) {
      dateRange.onDateRangeChange(range)
    }
    // If columnId is provided, set it as a column filter
    if (dateRange?.columnId && range) {
      const column = table.getColumn(dateRange.columnId)
      if (column) {
        column.setFilterValue(range)
      }
    }
  }

  const handleReset = () => {
    table.resetColumnFilters()
    table.setGlobalFilter('')
    if (dateRange?.enabled) {
      setDateRangeValue(undefined)
      if (dateRange.onDateRangeChange) {
        dateRange.onDateRangeChange(undefined)
      }
      if (dateRange.columnId) {
        const column = table.getColumn(dateRange.columnId)
        if (column) {
          column.setFilterValue(undefined)
        }
      }
    }
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch()
    } else {
      // 默认行为：触发表格重新过滤
      // 由于搜索是实时的，这里可以触发一个重新渲染
      table.resetRowSelection()
    }
  }

  const handleBulkReviseApply = () => {
    if (bulkRevise?.onApply && bulkReviseValue) {
      bulkRevise.onApply(bulkReviseType, bulkReviseValue)
      setBulkReviseValue('')
    }
  }

  // Avoid accessing non-existent columns (will trigger tanstack table warnings)
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined

  return (
    <div className='flex flex-wrap items-start justify-between gap-2'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* Filters (下拉框) - 放在最前面 */}
        <div className='flex flex-wrap items-center gap-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column || !column.columnDef) return null

            // Ensure column is ready for faceted filtering
            try {
              // Test if getFacetedUniqueValues is available and works
              if (typeof column.getFacetedUniqueValues === 'function') {
                column.getFacetedUniqueValues()
              }
            } catch (error) {
              console.warn(
                `Column ${filter.columnId} is not ready for filtering:`,
                error
              )
              return null
            }

            if (filter.useCategoryTree && filter.categories) {
              return (
                <CategoryTreeFacetedFilter
                  key={filter.columnId}
                  column={column}
                  title={filter.title}
                  categories={filter.categories}
                />
              )
            }

            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options || []}
              />
            )
          })}
        </div>
        {/* Search boxes (搜索框) - 放在下拉框后面 */}
        {showSearch && (
          <>
            {searchKey && searchColumn ? (
              <Input
                placeholder={searchPlaceholder}
                value={
                  (searchColumn.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  searchColumn.setFilterValue(event.target.value)
                }
                className='h-8 w-[150px] lg:w-[250px]'
              />
            ) : (
              <Input
                placeholder={searchPlaceholder}
                value={table.getState().globalFilter ?? ''}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className='h-8 w-[150px] lg:w-[250px]'
              />
            )}
          </>
        )}
        {extraSearch && (
          <Input
            placeholder={extraSearch.placeholder ?? 'Search...'}
            value={
              (table
                .getColumn(extraSearch.columnId)
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn(extraSearch.columnId)
                ?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        {extraSearch2 && (
          <Input
            placeholder={extraSearch2.placeholder ?? 'Search...'}
            value={
              (table
                .getColumn(extraSearch2.columnId)
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn(extraSearch2.columnId)
                ?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        {extraSearch3 && (
          <Input
            placeholder={extraSearch3.placeholder ?? 'Search...'}
            value={
              (table
                .getColumn(extraSearch3.columnId)
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn(extraSearch3.columnId)
                ?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        {/* Date Range Picker - 紧跟在搜索框后面 */}
        {dateRange?.enabled && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-8 w-[240px] justify-start text-left font-normal',
                  !dateRangeValue && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dateRangeValue?.from ? (
                  dateRangeValue.to ? (
                    <>
                      {format(dateRangeValue.from, 'yyyy-MM-dd')} -{' '}
                      {format(dateRangeValue.to, 'yyyy-MM-dd')}
                    </>
                  ) : (
                    format(dateRangeValue.from, 'yyyy-MM-dd')
                  )
                ) : (
                  <span>{dateRange.placeholder || 'Pick a date range'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRangeValue?.from}
                selected={dateRangeValue}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
        <div className='flex flex-wrap items-center gap-2'>
          {customFilterSlot}
          {/* Bulk Revise */}
          {bulkRevise?.enabled && (
            <div className='flex items-center'>
              <Select value={bulkReviseType} onValueChange={setBulkReviseType}>
                <SelectTrigger
                  size='sm'
                  className='h-8 w-32 rounded-r-none border-r-0 py-0 text-xs'
                >
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  {bulkRevise.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={bulkRevise?.placeholder || 'Enter value'}
                value={bulkReviseValue}
                onChange={(e) => setBulkReviseValue(e.target.value)}
                className='h-8 w-32 rounded-l-none border-l-0 py-0 text-xs'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBulkReviseApply()
                  }
                }}
              />
            </div>
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleReset}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {showSearchButton && (
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            onClick={handleSearch}
            className='h-8 bg-orange-500 text-white hover:bg-orange-600'
            size='sm'
          >
            <Search className='mr-2 h-4 w-4' />
            Search
          </Button>
        </div>
      )}
    </div>
  )
}

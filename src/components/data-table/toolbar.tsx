import { useState } from 'react'
import { format } from 'date-fns'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Calendar as CalendarIcon } from 'lucide-react'
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
import { CategoryTreeFacetedFilter } from './category-tree-faceted-filter'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
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
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
  dateRange,
}: DataTableToolbarProps<TData>) {
  const [dateRangeValue, setDateRangeValue] = useState<DateRange | undefined>(
    undefined
  )

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

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
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
        <div className='flex gap-x-2'>
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
          {/* Date Range Picker */}
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
      <DataTableViewOptions table={table} />
    </div>
  )
}

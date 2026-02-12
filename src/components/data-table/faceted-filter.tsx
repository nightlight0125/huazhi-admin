import * as React from 'react'
import { CheckIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  onFilterChange?: () => void
  columnFilters?: Array<{ id: string; value: unknown }>
  singleSelect?: boolean // 是否单选模式
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  onFilterChange,
  columnFilters,
  singleSelect = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  let facets: Map<string | number, number> = new Map()
  try {
    if (column && typeof column.getFacetedUniqueValues === 'function') {
      const facetedValues = column.getFacetedUniqueValues()
      if (facetedValues && facetedValues instanceof Map) {
        facets = facetedValues
      }
    }
  } catch (error) {
    console.warn('Error getting faceted unique values:', error)
  }

  const selectedValues = React.useMemo(() => {
    const columnValue = column?.getFilterValue()
    if (columnValue !== undefined && columnValue !== null) {
      const value = Array.isArray(columnValue)
        ? columnValue.map((v) => String(v))
        : [String(columnValue)]
      return new Set(value)
    }

    if (columnFilters && column) {
      const filter = columnFilters.find((f) => f.id === column.id)
      if (filter) {
        const value = Array.isArray(filter.value)
          ? filter.value.map((v) => String(v))
          : filter.value
            ? [String(filter.value)]
            : []
        return new Set(value)
      }
    }

    return new Set<string>()
  }, [columnFilters, column, title])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (singleSelect) {
                        // 单选模式：如果点击的是已选中的项，清除选择；否则只选择当前项
                        if (isSelected) {
                          column?.setFilterValue(undefined)
                        } else {
                          column?.setFilterValue([option.value])
                        }
                      } else {
                        // 多选模式：原有的逻辑
                        const nextSelected = new Set(selectedValues)
                        if (isSelected) {
                          nextSelected.delete(option.value)
                        } else {
                          nextSelected.add(option.value)
                        }
                        const filterValues = Array.from(nextSelected)
                        column?.setFilterValue(
                          filterValues.length > 0 ? filterValues : undefined
                        )
                      }
                      onFilterChange?.()
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary flex size-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('text-background h-4 w-4')} />
                    </div>
                    {option.icon && (
                      <option.icon className='text-muted-foreground size-4' />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      column?.setFilterValue(undefined)
                      onFilterChange?.()
                    }}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

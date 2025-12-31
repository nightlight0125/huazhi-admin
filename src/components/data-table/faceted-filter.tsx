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
  // 直接从 table 获取 columnFilters，因为 column.getFilterValue() 可能不准确
  columnFilters?: Array<{ id: string; value: unknown }>
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  onFilterChange,
  columnFilters,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Safely get faceted values with error handling
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

  // 优先从 columnFilters prop 获取值（更可靠），否则从 column.getFilterValue() 获取
  const getFilterValueFromProps = React.useCallback(() => {
    if (columnFilters && column) {
      const filter = columnFilters.find((f) => f.id === column.id)
      if (filter) {
        const result = Array.isArray(filter.value) ? (filter.value as string[]) : filter.value ? [String(filter.value)] : []
        console.log(`[${title}] getFilterValueFromProps:`, { columnFilters, columnId: column.id, filter, result })
        return result
      }
    }
    return []
  }, [columnFilters, column, title])

  // 从 column.getFilterValue() 获取值（作为后备）
  const getFilterValueFromColumn = React.useCallback(() => {
    const value = column?.getFilterValue()
    const result = Array.isArray(value) ? (value as string[]) : value ? [String(value)] : []
    console.log(`[${title}] getFilterValueFromColumn:`, { value, result })
    return result
  }, [column, title])

  // 优先使用 columnFilters prop 的值（如果找到了），否则使用 column.getFilterValue()
  const externalFilterValue = getFilterValueFromProps()
  const columnFilterValue = getFilterValueFromColumn()
  // 如果 externalFilterValue 找到了 filter（即使值是空数组），也优先使用它
  const hasExternalFilter = columnFilters && column && columnFilters.some((f) => f.id === column.id)
  const rawFilterValue = hasExternalFilter ? externalFilterValue : columnFilterValue

  console.log(`[${title}] rawFilterValue computed:`, {
    externalFilterValue,
    columnFilterValue,
    hasExternalFilter,
    rawFilterValue,
    columnFilters,
    columnId: column?.id,
  })

  // 使用本地状态作为单一数据源
  const [localSelected, setLocalSelected] = React.useState<string[]>(rawFilterValue)
  
  // 使用 ref 来跟踪是否是用户操作导致的更新
  const isUserActionRef = React.useRef(false)
  
  // 当外部 filterValue 变化时（例如从 URL 同步），同步到本地状态
  React.useEffect(() => {
    // 如果是用户操作导致的更新，跳过同步（用户操作已经更新了 localSelected）
    if (isUserActionRef.current) {
      isUserActionRef.current = false
      return
    }
    
    const currentStr = JSON.stringify([...rawFilterValue].sort())
    const currentLocalStr = JSON.stringify([...localSelected].sort())
    
    console.log(`[${title}] useEffect sync check:`, {
      rawFilterValue,
      localSelected,
      currentStr,
      currentLocalStr,
      willUpdate: currentStr !== currentLocalStr,
      isUserAction: isUserActionRef.current,
    })
    
    // 只有当外部值和本地状态不一致时才同步
    if (currentStr !== currentLocalStr) {
      console.log(`[${title}] Updating localSelected from:`, localSelected, 'to:', rawFilterValue)
      setLocalSelected(rawFilterValue)
    }
  }, [rawFilterValue, localSelected, title])

  // 直接使用 localSelected
  const selectedValues = new Set(localSelected)

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
                      const nextSelected = new Set(selectedValues)
                      if (isSelected) {
                        nextSelected.delete(option.value)
                      } else {
                        nextSelected.add(option.value)
                      }
                      const filterValues = Array.from(nextSelected)
                      
                      // 标记这是用户操作
                      isUserActionRef.current = true
                      
                      // 先更新本地状态（立即显示选中状态）
                      setLocalSelected(filterValues)
                      
                      // 然后更新 column 的 filterValue（这会触发 onColumnFiltersChange）
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                      
                      // 通知父组件过滤器已变化
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

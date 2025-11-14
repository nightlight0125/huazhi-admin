import { type Column } from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { CategoryTreeFilter } from '@/components/category-tree-filter'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

type CategoryTreeFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  categories: CategoryItem[]
}

export function CategoryTreeFacetedFilter<TData, TValue>({
  column,
  title,
  categories,
}: CategoryTreeFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const handleValueChange = (value: string, checked: boolean) => {
    const newSelectedValues = new Set(selectedValues)
    if (checked) {
      newSelectedValues.add(value)
    } else {
      newSelectedValues.delete(value)
    }
    const filterValues = Array.from(newSelectedValues)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
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
                  categories
                    .flatMap((cat) => [cat, ...(cat.children || [])])
                    .filter((item) => selectedValues.has(item.value))
                    .map((item) => (
                      <Badge
                        variant='secondary'
                        key={item.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {item.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
          <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[280px] p-0' align='start'>
        <div className='max-h-[400px] overflow-y-auto p-4'>
          <CategoryTreeFilter
            categories={categories}
            selectedValues={selectedValues}
            onValueChange={handleValueChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

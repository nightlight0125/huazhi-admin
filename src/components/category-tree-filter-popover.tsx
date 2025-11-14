import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CategoryTreeFilter } from './category-tree-filter'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronDown } from 'lucide-react'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

type CategoryTreeFilterPopoverProps = {
  title: string
  categories: CategoryItem[]
  selectedValues: Set<string>
  onValueChange: (value: string, checked: boolean) => void
}

export function CategoryTreeFilterPopover({
  title,
  categories,
  selectedValues,
  onValueChange,
}: CategoryTreeFilterPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal'
              >
                {selectedValues.size}
              </Badge>
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
            onValueChange={onValueChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}


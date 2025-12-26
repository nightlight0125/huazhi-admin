import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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

type StandaloneCategoryTreeSelectProps = {
  title?: string
  categories: CategoryItem[]
  selectedValues: Set<string>
  onSelectedValuesChange: (values: Set<string>) => void
  triggerClassName?: string
  singleSelect?: boolean // 如果为 true，只允许选择一个值
}

export function StandaloneCategoryTreeSelect({
  title,
  categories,
  selectedValues,
  onSelectedValuesChange,
  triggerClassName,
  singleSelect = false,
}: StandaloneCategoryTreeSelectProps) {
  const handleValueChange = (value: string, checked: boolean) => {
    const newSelectedValues = new Set(selectedValues)
    if (singleSelect) {
      // 单选模式：清除其他选择，只保留当前选择
      newSelectedValues.clear()
      if (checked) {
        newSelectedValues.add(value)
      }
    } else {
      // 多选模式
      if (checked) {
        newSelectedValues.add(value)
      } else {
        newSelectedValues.delete(value)
      }
    }
    onSelectedValuesChange(newSelectedValues)
  }

  // 获取显示文本（单选模式下显示选中的第一个值）
  const getDisplayText = () => {
    if (selectedValues.size === 0) {
      return title || 'Select...'
    }
    if (singleSelect) {
      const selectedValue = Array.from(selectedValues)[0]
      const findLabel = (cats: CategoryItem[]): string | null => {
        for (const cat of cats) {
          if (cat.value === selectedValue) return cat.label
          if (cat.children) {
            const found = findLabel(cat.children)
            if (found) return found
          }
        }
        return null
      }
      return findLabel(categories) || title || 'Select...'
    }
    return title || 'Select...'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-8 border-dashed', triggerClassName)}
        >
          {getDisplayText()}
          {selectedValues?.size > 0 && !singleSelect && (
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

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

type CategoryTreeFilterProps = {
  categories: CategoryItem[]
  selectedValues: Set<string>
  onValueChange: (value: string, checked: boolean) => void
  className?: string
}

export function CategoryTreeFilter({
  categories,
  selectedValues,
  onValueChange,
  className,
}: CategoryTreeFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  const toggleExpand = (value: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  const handleCategoryChange = (
    value: string,
    checked: boolean,
    children?: CategoryItem[]
  ) => {
    onValueChange(value, checked)
    
    // If category has children and is being checked, also check all children
    if (checked && children) {
      children.forEach((child) => {
        if (!selectedValues.has(child.value)) {
          onValueChange(child.value, true)
        }
      })
    }
  }

  const isCategoryChecked = (category: CategoryItem): boolean => {
    if (selectedValues.has(category.value)) {
      return true
    }
    // If all children are checked, parent is considered checked
    if (category.children && category.children.length > 0) {
      return category.children.every((child) => selectedValues.has(child.value))
    }
    return false
  }

  const isCategoryIndeterminate = (category: CategoryItem): boolean => {
    if (!category.children || category.children.length === 0) {
      return false
    }
    const checkedChildren = category.children.filter((child) =>
      selectedValues.has(child.value)
    )
    return checkedChildren.length > 0 && checkedChildren.length < category.children.length
  }

  return (
    <div className={cn('space-y-1', className)}>
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0
        const isExpanded = expandedCategories.has(category.value)
        const isChecked = isCategoryChecked(category)
        const isIndeterminate = isCategoryIndeterminate(category)

        return (
          <div key={category.value}>
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleExpand(category.value)}
            >
              <div
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5',
                  isExpanded && 'bg-muted'
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(
                      category.value,
                      checked as boolean,
                      category.children
                    )
                  }
                  className={cn(
                    isIndeterminate && 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                  )}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isIndeterminate
                    }
                  }}
                />
                <span className='flex-1 text-sm'>{category.label}</span>
                {hasChildren && (
                  <CollapsibleTrigger asChild>
                    <button className='flex items-center justify-center p-0.5 hover:bg-accent rounded-sm'>
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
              {hasChildren && (
                <CollapsibleContent>
                  <div className='ml-6 space-y-1 mt-1'>
                    {category.children!.map((child) => (
                      <div
                        key={child.value}
                        className='flex items-center gap-2 rounded-md px-2 py-1.5'
                      >
                        <Checkbox
                          checked={selectedValues.has(child.value)}
                          onCheckedChange={(checked) =>
                            onValueChange(child.value, checked as boolean)
                          }
                        />
                        <span className='flex-1 text-sm'>{child.label}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>
        )
      })}
    </div>
  )
}


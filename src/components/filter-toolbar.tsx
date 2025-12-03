import type { ReactNode } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FilterToolbarProps = {
  className?: string
  /** 是否显示搜索输入框 */
  showSearch?: boolean
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 搜索值（可选，支持非受控场景） */
  searchValue?: string
  /** 搜索值变更回调 */
  onSearchChange?: (value: string) => void
  /** 是否显示 Reset 按钮 */
  isFiltered?: boolean
  onReset?: () => void
  /** 点击 Search 按钮 */
  onSearchClick?: () => void
  /** 右侧筛选控件：可以是多个 Input、Select、多选组件等 */
  filters?: ReactNode[]
  /** 右侧额外区域，比如视图切换等 */
  rightSlot?: ReactNode
}

/**
 * 通用筛选工具栏（简版 DataTableToolbar）：
 * - 左侧：可选搜索输入框 + 一组筛选控件
 * - 右侧：Search 按钮 + 可选 Reset / 额外操作
 * - 外部通过 props 决定显示哪些控件，实现完全复用
 */
export function FilterToolbar({
  className,
  showSearch = true,
  searchPlaceholder = 'Search',
  searchValue,
  onSearchChange,
  isFiltered,
  onReset,
  onSearchClick,
  filters = [],
  rightSlot,
}: FilterToolbarProps) {
  const handleSearchInputChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        className
      )}
    >
      {/* 左侧：搜索 + 筛选 */}
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {showSearch && (
          <div className='relative w-full sm:w-[260px]'>
            <SearchIcon className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              type='text'
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className='h-9 pl-9'
            />
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2'>
          {filters.map((node, index) => (
            <span key={index}>{node}</span>
          ))}
          {isFiltered && onReset && (
            <Button
              variant='ghost'
              onClick={onReset}
              className='h-8 px-2 lg:px-3'
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 右侧：Search 按钮 + 额外区域 */}
      <div className='flex items-center gap-2'>
        <Button
          onClick={onSearchClick}
          className='h-8 bg-orange-500 text-white hover:bg-orange-600'
          size='sm'
        >
          <SearchIcon className='mr-2 h-4 w-4' />
          Search
        </Button>
        {rightSlot}
      </div>
    </div>
  )
}


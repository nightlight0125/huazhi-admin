import { Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ViewType = 'list' | 'grid'

interface ProductsViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function ProductsViewToggle({ view, onViewChange }: ProductsViewToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-8'>
          {view === 'list' ? (
            <>
              <List className='mr-2 h-4 w-4' />
              列表视图
            </>
          ) : (
            <>
              <Grid3X3 className='mr-2 h-4 w-4' />
              网格视图
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => onViewChange('list')}
          className={view === 'list' ? 'bg-accent' : ''}
        >
          <List className='mr-2 h-4 w-4' />
          列表视图
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onViewChange('grid')}
          className={view === 'grid' ? 'bg-accent' : ''}
        >
          <Grid3X3 className='mr-2 h-4 w-4' />
          网格视图
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

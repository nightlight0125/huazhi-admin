import { useState, useRef, useEffect } from 'react'
import { X, CircleArrowUp, ArrowUpDown, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { storeProductStatuses } from '../data/store-products-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface AssociatedBulkActionsProps {
  selectedIds: Set<string>
  onClearSelection: () => void
}

const CONFIRM_WORD = 'DELETE'

export function AssociatedBulkActions({
  selectedIds,
  onClearSelection,
}: AssociatedBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = useState('')

  const selectedCount = selectedIds.size

  // Announce selection changes to screen readers
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} product${selectedCount > 1 ? 's' : ''} selected. Bulk actions toolbar is available.`
      setAnnouncement(message)

      // Clear announcement after a delay
      const timer = setTimeout(() => setAnnouncement(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [selectedCount])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll('button')
    if (!buttons) return

    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement
    )

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % buttons.length
        buttons[nextIndex]?.focus()
        break
      }
      case 'ArrowLeft': {
        event.preventDefault()
        const prevIndex =
          currentIndex === 0 ? buttons.length - 1 : currentIndex - 1
        buttons[prevIndex]?.focus()
        break
      }
      case 'Home':
        event.preventDefault()
        buttons[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        buttons[buttons.length - 1]?.focus()
        break
      case 'Escape': {
        const target = event.target as HTMLElement
        const activeElement = document.activeElement as HTMLElement

        const isFromDropdownTrigger =
          target?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
          activeElement?.getAttribute('data-slot') ===
            'dropdown-menu-trigger' ||
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          activeElement?.closest('[data-slot="dropdown-menu-trigger"]')

        const isFromDropdownContent =
          activeElement?.closest('[data-slot="dropdown-menu-content"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]')

        if (isFromDropdownTrigger || isFromDropdownContent) {
          return
        }

        event.preventDefault()
        onClearSelection()
        break
      }
    }
  }

  const handleBulkStatusChange = (status: string) => {
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        onClearSelection()
        return `Status updated to "${status}" for ${selectedCount} product${selectedCount > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
  }

  const handleBulkExport = () => {
    toast.promise(sleep(2000), {
      loading: 'Exporting products...',
      success: () => {
        onClearSelection()
        return `Exported ${selectedCount} product${selectedCount > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error',
    })
  }

  const handleDelete = () => {
    if (deleteConfirmValue.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    setShowDeleteConfirm(false)
    setDeleteConfirmValue('')

    toast.promise(sleep(2000), {
      loading: 'Deleting products...',
      success: () => {
        onClearSelection()
        return `Deleted ${selectedCount} ${
          selectedCount > 1 ? 'products' : 'product'
        }`
      },
      error: 'Error',
    })
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        role='status'
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role='toolbar'
        aria-label={`Bulk actions for ${selectedCount} selected product${selectedCount > 1 ? 's' : ''}`}
        aria-describedby='bulk-actions-description'
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl',
          'transition-all delay-100 duration-300 ease-out hover:scale-105',
          'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
        )}
      >
        <div
          className={cn(
            'p-2 shadow-xl',
            'rounded-xl border',
            'bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg',
            'flex items-center gap-x-2'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={onClearSelection}
                className='size-6 rounded-full'
                aria-label='Clear selection'
                title='Clear selection (Escape)'
              >
                <X />
                <span className='sr-only'>Clear selection</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear selection (Escape)</p>
            </TooltipContent>
          </Tooltip>

          <Separator
            className='h-5'
            orientation='vertical'
            aria-hidden='true'
          />

          <div
            className='flex items-center gap-x-1 text-sm'
            id='bulk-actions-description'
          >
            <Badge
              variant='default'
              className='min-w-8 rounded-lg bg-orange-500'
              aria-label={`${selectedCount} selected`}
            >
              {selectedCount}
            </Badge>{' '}
            <span className='hidden sm:inline'>
              product{selectedCount > 1 ? 's' : ''}
            </span>{' '}
            selected
          </div>

          <Separator
            className='h-5'
            orientation='vertical'
            aria-hidden='true'
          />

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-8'
                    aria-label='Update status'
                    title='Update status'
                  >
                    <CircleArrowUp />
                    <span className='sr-only'>Update status</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Update status</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent sideOffset={14}>
              {storeProductStatuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => handleBulkStatusChange(status.value)}
                >
                  {status.icon && (
                    <status.icon className='text-muted-foreground size-4 mr-2' />
                  )}
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='size-8'
                    aria-label='Sort options'
                    title='Sort options'
                  >
                    <ArrowUpDown />
                    <span className='sr-only'>Sort options</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sort options</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent sideOffset={14}>
              <DropdownMenuItem onClick={() => console.log('Sort by store price')}>
                Sort by Store Price
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Sort by hz price')}>
                Sort by Price
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={handleBulkExport}
                className='size-8'
                aria-label='Export products'
                title='Export products'
              >
                <Download />
                <span className='sr-only'>Export products</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export products</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Delete selected products'
                title='Delete selected products'
              >
                <Trash2 />
                <span className='sr-only'>Delete selected products</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected products</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open)
          if (!open) {
            setDeleteConfirmValue('')
          }
        }}
        handleConfirm={handleDelete}
        disabled={deleteConfirmValue.trim() !== CONFIRM_WORD}
        title={
          <span className='text-destructive'>
            <AlertTriangle
              className='stroke-destructive me-1 inline-block'
              size={18}
            />{' '}
            Delete {selectedCount} {selectedCount > 1 ? 'products' : 'product'}
          </span>
        }
        desc={
          <div className='space-y-4'>
            <p className='mb-2'>
              Are you sure you want to delete the selected products? <br />
              This action cannot be undone.
            </p>

            <Label className='my-4 flex flex-col items-start gap-1.5'>
              <span className=''>Confirm by typing "{CONFIRM_WORD}":</span>
              <Input
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              />
            </Label>

            <Alert variant='destructive'>
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Please be careful, this operation can not be rolled back.
              </AlertDescription>
            </Alert>
          </div>
        }
        confirmText='Delete'
        destructive
      />
    </>
  )
}


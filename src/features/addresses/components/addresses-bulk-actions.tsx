import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Address } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function AddressesBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkUpload = () => {
    const selectedAddresses = selectedRows.map((row) => row.original as Address)
    toast.promise(sleep(2000), {
      loading: 'Uploading addresses...',
      success: () => {
        table.resetRowSelection()
        return `Uploaded ${selectedAddresses.length} address${selectedAddresses.length > 1 ? 'es' : ''}`
      },
      error: 'Error uploading addresses',
    })
    table.resetRowSelection()
  }

  const handleBulkReorder = () => {
    const selectedAddresses = selectedRows.map((row) => row.original as Address)
    toast.promise(sleep(2000), {
      loading: 'Reordering addresses...',
      success: () => {
        table.resetRowSelection()
        return `Reordered ${selectedAddresses.length} address${selectedAddresses.length > 1 ? 'es' : ''}`
      },
      error: 'Error reordering addresses',
    })
    table.resetRowSelection()
  }

  const handleBulkDownload = () => {
    const selectedAddresses = selectedRows.map((row) => row.original as Address)
    toast.promise(sleep(2000), {
      loading: 'Downloading addresses...',
      success: () => {
        table.resetRowSelection()
        return `Downloaded ${selectedAddresses.length} address${selectedAddresses.length > 1 ? 'es' : ''}`
      },
      error: 'Error downloading addresses',
    })
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selectedAddresses = selectedRows.map((row) => row.original as Address)
    toast.promise(sleep(2000), {
      loading: 'Deleting addresses...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedAddresses.length} address${selectedAddresses.length > 1 ? 'es' : ''}`
      },
      error: 'Error deleting addresses',
    })
    table.resetRowSelection()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='address'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkUpload}
              className='size-8'
              aria-label='Upload selected addresses'
              title='Upload selected addresses'
            >
              <CircleArrowUp />
              <span className='sr-only'>Upload selected addresses</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload selected addresses</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkReorder}
              className='size-8'
              aria-label='Reorder selected addresses'
              title='Reorder selected addresses'
            >
              <ArrowUpDown />
              <span className='sr-only'>Reorder selected addresses</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reorder selected addresses</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkDownload}
              className='size-8'
              aria-label='Download selected addresses'
              title='Download selected addresses'
            >
              <Download />
              <span className='sr-only'>Download selected addresses</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download selected addresses</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected addresses'
              title='Delete selected addresses'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected addresses</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected addresses</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-background rounded-lg border p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-2'>Confirm Delete</h3>
            <p className='text-muted-foreground mb-4'>
              Are you sure you want to delete {selectedRows.length} address{selectedRows.length > 1 ? 'es' : ''}? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant='destructive' onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


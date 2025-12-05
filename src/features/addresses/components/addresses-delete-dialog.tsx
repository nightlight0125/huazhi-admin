'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Address } from '../data/schema'

type AddressDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Address
}

export function AddressesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AddressDeleteDialogProps) {
  const [value, setValue] = useState('')
  const fullName = `${currentRow.firstName} ${currentRow.lastName}`

  const handleDelete = () => {
    if (value.trim() !== fullName) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following address has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== fullName}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Address
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the address for{' '}
            <span className='font-bold'>{fullName}</span>?
            <br />
            This action will permanently delete this address from the system. This action cannot be undone.
          </p>

          <Label className='my-2'>
            Full Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter full name to confirm deletion'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please proceed with caution, this action cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}


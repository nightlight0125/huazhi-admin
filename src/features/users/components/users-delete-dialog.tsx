'use client'

import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { deleteAccount } from '@/lib/api/users'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const { auth } = useAuthStore()
  const { onRefresh } = useUsers()

  const handleDelete = async () => {
    // 获取当前登录用户的 id 作为 customerId
    const currentUserId = auth.user?.customerId

    const loadingToast = toast.loading('Deleting user...')

    try {
      await deleteAccount(String(currentUserId), currentRow.id)

      toast.dismiss(loadingToast)
      toast.success('User deleted successfully!')
      onOpenChange(false)
      // 刷新用户列表
      onRefresh?.()
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete user. Please try again.'
      toast.error(errorMessage)
      console.error('Delete user error:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          delete user
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the user{' '}
            <span className='font-bold'>{currentRow.username}</span> 吗？
            <br />
            This action will permanently delete the user from the system. This
            action cannot be undone.
          </p>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}

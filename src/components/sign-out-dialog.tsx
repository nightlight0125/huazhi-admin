import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { parseInviteSearchParamsFromHref } from '@/lib/invite-search-params'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const auth = useAuthStore((s) => s.auth)
  const setSigningOut = useAuthStore((s) => s.setSigningOut)

  const handleSignOut = () => {
    setSigningOut(true)
    void queryClient.cancelQueries()
    auth.reset()
    const currentPath = location.href
    navigate({
      to: '/sign-in',
      search: {
        redirect: currentPath,
        ...parseInviteSearchParamsFromHref(currentPath),
      },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

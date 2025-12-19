import { Link } from '@tanstack/react-router'
import { Copy, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const authUser = useAuthStore((state: any) => state.auth.user)

  // 获取用户名的首字母作为头像
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  // 复制ID功能
  const handleCopyId = async () => {
    const userId = authUser?.id || authUser?.accountNo || ''
    if (!userId) {
      toast.error('No ID available to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(userId)
      toast.success('ID copied to clipboard')
    } catch (error) {
      console.error('Failed to copy ID:', error)
      toast.error('Failed to copy ID')
    }
  }

  const userId = authUser?.id || authUser?.accountNo || 'N/A'
  const username = authUser?.username || 'User'

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
            <User className='size-[1.2rem]' />
            <span className='sr-only'>User Profile</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-64' align='end' forceMount>
          <DropdownMenuLabel className='p-4 font-normal'>
            <div className='flex items-start gap-3'>
              {/* Avatar */}
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600'>
                <span className='text-lg font-bold'>
                  {getInitials(username)}
                </span>
              </div>

              {/* User Info */}
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                {/* First Row: Level Badge + Username + Arrow */}
                <div className='flex items-center gap-2'>
                  <span className='truncate text-sm font-medium text-gray-900'>
                    {username}
                  </span>
                </div>

                {/* Second Row: ID Badge + ID + Copy Icon */}
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center rounded-md bg-orange-500 px-2 py-0.5 text-xs font-medium text-white'>
                    ID
                  </span>
                  <span className='truncate text-sm font-medium text-gray-900'>
                    {userId}
                  </span>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyId()
                    }}
                    className='shrink-0 text-gray-400 transition-colors hover:text-gray-600'
                    title='Copy ID'
                  >
                    <Copy className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}

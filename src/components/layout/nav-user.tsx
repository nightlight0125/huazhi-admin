import { ChevronsUpDown, Copy, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import useDialogState from '@/hooks/use-dialog-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'

type NavUserProps = {
  user?: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user: _propUser }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  const authUser = useAuthStore((state) => state.auth.user)

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

  const username =
    authUser?.username || authUser?.accountNo || authUser?.email || 'User'
  const userId = authUser?.id || authUser?.accountNo || 'N/A'

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600'>
                  <span className='text-sm font-bold'>
                    {getInitials(username)}
                  </span>
                </div>
                <div className='flex min-w-0 flex-1 flex-col gap-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{username}</span>
                  <div className='flex items-center gap-1.5'>
                    <span className='inline-flex items-center rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-medium text-white'>
                      ID
                    </span>
                    <span className='text-muted-foreground truncate text-xs'>
                      {userId}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
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
                    {/* First Row: Username */}
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
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}

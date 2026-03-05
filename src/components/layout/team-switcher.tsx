import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType | string
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  useSidebar() // sidebar context for menu behavior
  const [activeTeam] = React.useState(teams[0])

  const renderLogo = (logo: React.ElementType | string, className: string) => {
    if (typeof logo === 'string') {
      return (
        <img
          src={logo}
          alt='team logo'
          className={`h-full w-full object-contain ${className}`}
        />
      )
    }

    const LogoComponent = logo
    return <LogoComponent className={className} />
  }

  return (
    <SidebarMenu className='mb-2'>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center'
            >
              <div className='flex h-10 w-45 shrink-0 items-center justify-center md:h-10 md:w-45'>
                {renderLogo(activeTeam.logo, 'h-full w-auto')}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ms-auto shrink-0 group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

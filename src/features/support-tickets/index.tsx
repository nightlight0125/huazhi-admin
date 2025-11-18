import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { SupportTicketsTable } from './components/support-tickets-table'
import { supportTickets } from './data/data'

export function SupportTickets() {
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <SupportTicketsTable data={supportTickets} />
        </div>
      </Main>
    </>
  )
}

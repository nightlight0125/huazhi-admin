import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SupportTicketsTable } from './components/support-tickets-table'
import { supportTickets } from './data/data'

export function SupportTickets() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <SupportTicketsTable data={supportTickets} />
        </div>
      </Main>
    </>
  )
}

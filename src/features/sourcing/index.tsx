import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SourcingTable } from './components/sourcing-table'
import { sourcingData } from './data/data'

export function Sourcing() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <SourcingTable data={sourcingData} />
        </div>
      </Main>
    </>
  )
}

import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LogisticsTable } from './components/logistics-table'
import { logisticsData } from './data/data'

export function Logistics() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <LogisticsTable data={logisticsData} />
        </div>
      </Main>
    </>
  )
}


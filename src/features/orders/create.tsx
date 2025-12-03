import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OrdersCreatePage } from './components/orders-create-page'

export function OrdersCreate() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <OrdersCreatePage />
        </div>
      </Main>
    </>
  )
}


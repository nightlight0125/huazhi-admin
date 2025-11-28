import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/header-actions'
import { InventoryTable } from './components/inventory-table'
import { inventoryItems } from './data/data'

export function MyInventory() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <InventoryTable data={inventoryItems} />
        </div>
      </Main>
    </>
  )
}

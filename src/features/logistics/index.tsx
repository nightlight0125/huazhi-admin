import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LogisticsTable } from './components/logistics-table'
import { ShippingPlanDialog } from './components/shipping-plan-dialog'
import { logisticsData } from './data/data'

export function Logistics() {
  const [shippingPlanOpen, setShippingPlanOpen] = useState(false)

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 space-y-4 overflow-auto px-4 py-1'>
          <div className='flex justify-end'>
            <Button
              size='sm'
              className='bg-orange-500 text-white hover:bg-orange-600'
              onClick={() => setShippingPlanOpen(true)}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Shipping Plan
            </Button>
          </div>
          <LogisticsTable data={logisticsData} />
        </div>
      </Main>

      <ShippingPlanDialog
        open={shippingPlanOpen}
        onOpenChange={setShippingPlanOpen}
      />
    </>
  )
}

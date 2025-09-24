import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { WalletStats } from './components/wallet-stats'
import { WalletTable } from './components/wallet-table'
import { WalletRechargeDialog } from './components/wallet-recharge-dialog'
import { walletRecords, walletStats } from './data/wallet-records'

export function Wallet() {
  const [showRechargeDialog, setShowRechargeDialog] = useState(false)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>钱包管理</h2>
            <p className='text-muted-foreground'>
              管理您的账户余额、充值记录和发票信息
            </p>
          </div>
          <Button onClick={() => setShowRechargeDialog(true)}>
            <Plus className='h-4 w-4 mr-2' />
            账户充值
          </Button>
        </div>

        {/* 钱包统计 */}
        <div className='mb-6'>
          <WalletStats stats={walletStats} />
        </div>

        {/* 钱包记录列表 */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <WalletTable data={walletRecords} />
        </div>
      </Main>

      <WalletRechargeDialog
        open={showRechargeDialog}
        onOpenChange={setShowRechargeDialog}
      />
    </>
  )
}

import { useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'

export function PodDesign() {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate({ to: '/products' })
  }

  const handleSave = () => {
    // TODO: 接入实际的设计保存逻辑
    console.log('Save POD design')
  }

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
        <div className='flex h-full flex-col'>
          {/* 设计区域占满剩余空间，后续可嵌入实际设计器 */}
          <div className='flex-1 overflow-auto bg-background'>
            {/* POD Design content / iframe placeholder */}
          </div>

          {/* 底部操作条：取消 / 保存 按钮，沿用项目样式 */}
          <div className='border-t bg-background px-6 py-3'>
            <div className='flex items-center justify-end gap-2'>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}


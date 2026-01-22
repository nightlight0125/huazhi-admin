import { useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { HeaderActions } from '@/components/header-actions'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'

export function PodDesign() {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate({ to: '/all-products' })
  }

  const handleSave = () => {
    // TODO: 接入实际的设计保存逻辑
    console.log('Save POD design')
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>
      <Main>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-auto bg-background'>
            {/* POD Design content / iframe placeholder */}
          </div>

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


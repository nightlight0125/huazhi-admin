import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStoreProducts } from './store-products-provider'

export function StoreProductsPrimaryButtons() {
  const { setOpen, setSearchKeyword } = useStoreProducts()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = () => {
    // 设置搜索关键词，触发 not-associated-connection-view 中的 useEffect 重新加载数据
    setSearchKeyword(searchValue)
  }

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center gap-2'>
        <Input
          type='text'
          placeholder='enter store product\name\ID'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className='border-border focus-visible:ring-ring h-8 min-w-[200px] flex-1 rounded-md shadow-sm focus-visible:ring-2'
        />
        <Button
          onClick={handleSearch}
          className='h-8 rounded-md bg-orange-500 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2'
        >
          <Search className='mr-2 h-4 w-4' />
          Search
        </Button>
      </div>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import Store Product</span>
      </Button>
    </div>
  )
}

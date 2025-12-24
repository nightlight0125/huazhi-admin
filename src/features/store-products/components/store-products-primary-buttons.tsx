import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStoreProducts } from './store-products-provider'

export function StoreProductsPrimaryButtons() {
  const { setOpen } = useStoreProducts()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = () => {
    // TODO: 实现搜索逻辑
    console.log('Search:', searchValue)
  }

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center gap-2'>
        <Input
          type='text'
          placeholder='enter store product\name\ID'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className='h-9 flex-1 rounded-md shadow-sm'
        />
        <Button
          onClick={handleSearch}
          className='h-9 bg-orange-500 text-white shadow-sm hover:bg-orange-600'
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

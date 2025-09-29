import { createContext, useContext, useState } from 'react'
import { type BrandItem } from '../data/schema'

type DialogType = 'view' | 'edit' | 'delete' | null

type BrandsContextType = {
  open: DialogType
  setOpen: (open: DialogType) => void
  currentRow: BrandItem | null
  setCurrentRow: (row: BrandItem | null) => void
}

const BrandsContext = createContext<BrandsContextType | undefined>(undefined)

export function BrandsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<BrandItem | null>(null)

  return (
    <BrandsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </BrandsContext.Provider>
  )
}

export function useBrands() {
  const context = useContext(BrandsContext)
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandsProvider')
  }
  return context
}

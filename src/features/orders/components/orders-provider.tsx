import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Order } from '../data/schema'

type OrdersDialogType = 'create' | 'update' | 'delete' | 'import' | 'sync'

type OrdersContextType = {
  open: OrdersDialogType | null
  setOpen: (str: OrdersDialogType | null) => void
  currentRow: Order | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Order | null>>
  refreshNonce: number
  triggerRefresh: () => void
}

const OrdersContext = React.createContext<OrdersContextType | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Order | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const triggerRefresh = () => {
    setRefreshNonce((n) => n + 1)
  }

  return (
    <OrdersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshNonce,
        triggerRefresh,
      }}
    >
      {children}
    </OrdersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ordersContext = React.useContext(OrdersContext)

  if (!ordersContext) {
    throw new Error('useOrders has to be used within <OrdersContext>')
  }

  return ordersContext
}

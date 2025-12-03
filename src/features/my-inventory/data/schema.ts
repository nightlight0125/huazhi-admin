export type InventoryItem = {
  id: string
  spu: string
  sku: string
  price: number
  /** 仓库名称或位置 */
  warehouse: string
  /** 当前库存总数 */
  qty: number
  /** 可用库存（可售） */
  availableInventory: number
  /** 采购在途数量 */
  underProcurement: number
}


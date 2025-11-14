import { type Sourcing } from './schema'

export const sourcingStatuses = [
  {
    value: 'processing',
    label: 'Processing',
    icon: undefined,
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: undefined,
  },
  {
    value: 'failed',
    label: 'Failed',
    icon: undefined,
  },
] as const

export const sourcingData: Sourcing[] = [
  {
    id: '1',
    sourcingId: 'SRC00038775',
    url: 'https://example.com/product/1',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=100&h=100&fit=crop',
    ],
    productName:
      'Split Skirt Women\'s Summer Long Skirt 100.00kg New Modal Strap A-line Skirt Slim-fit Long Skirt Skirt',
    status: 'processing',
    result: undefined,
    remark: undefined,
    createdTime: new Date('2025-10-27T11:38:49'),
    resultTime: undefined,
  },
  {
    id: '2',
    sourcingId: 'SRC00038776',
    url: 'https://example.com/product/2',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop',
    ],
    productName: 'Summer Dress Women\'s Casual Floral Print',
    status: 'completed',
    result: 'Success',
    remark: 'Product matched successfully',
    createdTime: new Date('2025-10-26T09:15:30'),
    resultTime: new Date('2025-10-26T10:20:15'),
  },
  {
    id: '3',
    sourcingId: 'SRC00038777',
    url: 'https://example.com/product/3',
    images: [],
    productName: 'Men\'s T-Shirt Cotton Basic',
    status: 'failed',
    result: 'Failed',
    remark: 'No matching product found',
    createdTime: new Date('2025-10-25T14:22:10'),
    resultTime: new Date('2025-10-25T14:25:30'),
  },
]


import { getWarehouseList, type WarehouseItem } from '@/lib/api/logistics'
import { useEffect, useRef, useState } from 'react'

export interface WarehouseOption {
    label: string
    value: string
}

// 全局缓存
let warehousesCache: WarehouseOption[] | null = null
let isWarehousesLoading = false
let warehousesLoadPromise: Promise<WarehouseOption[]> | null = null

/**
 * 获取仓库选项的 Hook
 * @param pageNo 页码，默认为 1
 * @param pageSize 每页数量，默认为 1000
 * @param enabled 是否启用加载，默认为 true
 * @returns 仓库选项数组和加载状态
 */
export function useWarehouses(
    pageNo: number = 1,
    pageSize: number = 1000,
    enabled: boolean = true
) {
    const [warehouses, setWarehouses] = useState<WarehouseOption[]>(warehousesCache || [])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const hasLoadedRef = useRef(false)

    useEffect(() => {
        // 如果已禁用，跳过
        if (!enabled) {
            return
        }

        // 如果缓存存在，直接使用
        if (warehousesCache) {
            setWarehouses(warehousesCache)
            hasLoadedRef.current = true
            return
        }

        // 如果已加载过，跳过
        if (hasLoadedRef.current) {
            return
        }

        // 如果正在加载，等待现有请求
        if (isWarehousesLoading && warehousesLoadPromise) {
            warehousesLoadPromise
                .then((data) => {
                    setWarehouses(data)
                    hasLoadedRef.current = true
                })
                .catch((err) => {
                    const error = err instanceof Error ? err : new Error('Failed to load warehouses')
                    setError(error)
                })
            return
        }

        // 开始加载
        hasLoadedRef.current = true
        isWarehousesLoading = true
        setIsLoading(true)
        setError(null)

        const loadWarehouses = async () => {
            try {
                const warehouseList = await getWarehouseList(pageNo, pageSize)
                const warehouseOptions: WarehouseOption[] = warehouseList.map(
                    (warehouse: WarehouseItem) => {
                        // 处理名称字段，可能是字符串或对象
                        let label = ''
                        if (typeof warehouse.name === 'string') {
                            label = warehouse.name
                        } else if (warehouse.hzkj_name) {
                            if (typeof warehouse.hzkj_name === 'string') {
                                label = warehouse.hzkj_name
                            } else if (typeof warehouse.hzkj_name === 'object') {
                                const nameObj = warehouse.hzkj_name as { GLang?: string; zh_CN?: string;[key: string]: unknown }
                                label = nameObj.GLang || nameObj.zh_CN || ''
                            }
                        } else if (warehouse.number) {
                            label = warehouse.number
                        }

                        return {
                            label: label || warehouse.id,
                            value: warehouse.id || '',
                        }
                    }
                )

                // 更新缓存
                warehousesCache = warehouseOptions
                setWarehouses(warehouseOptions)
                return warehouseOptions
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to load warehouses')
                setError(error)
                console.error('Failed to load warehouses:', err)
                throw error
            } finally {
                setIsLoading(false)
                isWarehousesLoading = false
                warehousesLoadPromise = null
            }
        }

        warehousesLoadPromise = loadWarehouses()
    }, [pageNo, pageSize, enabled])

    return { warehouses, isLoading, error }
}


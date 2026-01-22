import { getLogsList, type CustomChannelItem } from '@/lib/api/logistics'
import { useEffect, useRef, useState } from 'react'

export interface LogisticsChannelOption {
  label: string
  value: string
}

// 全局缓存
let channelsCache: LogisticsChannelOption[] | null = null
let isChannelsLoading = false
let channelsLoadPromise: Promise<LogisticsChannelOption[]> | null = null

/**
 * 获取物流渠道选项的 Hook
 * @param pageNo 页码，默认为 1
 * @param pageSize 每页数量，默认为 1000
 * @param enabled 是否启用加载，默认为 true
 * @returns 物流渠道选项数组和加载状态
 */
export function useLogisticsChannels(
  pageNo: number = 1,
  pageSize: number = 1000,
  enabled: boolean = true
) {
  const [channels, setChannels] = useState<LogisticsChannelOption[]>(channelsCache || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // 如果已禁用，跳过
    if (!enabled) {
      return
    }

    // 如果缓存存在，直接使用
    if (channelsCache) {
      setChannels(channelsCache)
      hasLoadedRef.current = true
      return
    }

    // 如果已加载过，跳过
    if (hasLoadedRef.current) {
      return
    }

    // 如果正在加载，等待现有请求
    if (isChannelsLoading && channelsLoadPromise) {
      channelsLoadPromise
        .then((data) => {
          setChannels(data)
          hasLoadedRef.current = true
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Failed to load logistics channels')
          setError(error)
        })
      return
    }

    // 开始加载
    hasLoadedRef.current = true
    isChannelsLoading = true
    setIsLoading(true)
    setError(null)

    const loadChannels = async () => {
      try {
        const channelList = await getLogsList(pageNo, pageSize)
        const channelOptions: LogisticsChannelOption[] = channelList.map(
          (channel: CustomChannelItem) => ({
            label: channel.name || '',
            value: channel.id || '',
          })
        )
        
        // 更新缓存
        channelsCache = channelOptions
        setChannels(channelOptions)
        return channelOptions
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load logistics channels')
        setError(error)
        console.error('Failed to load logistics channels:', err)
        throw error
      } finally {
        setIsLoading(false)
        isChannelsLoading = false
        channelsLoadPromise = null
      }
    }

    channelsLoadPromise = loadChannels()
  }, [pageNo, pageSize, enabled])

  return { channels, isLoading, error }
}


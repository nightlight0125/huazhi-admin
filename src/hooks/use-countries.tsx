import React from 'react'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import { useEffect, useRef, useState } from 'react'
import worldCountries from 'world-countries'

// 创建国旗图标组件
const createFlagIcon = (countryCode: string) => {
  const FlagIcon = ({ className }: { className?: string }) => {
    const code = countryCode.toLowerCase()
    return <span className={`fi fi-${code} ${className || ''}`} />
  }
  return FlagIcon
}

export interface CountryOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

// 全局缓存
let countriesCache: CountryOption[] | null = null
let isCountriesLoading = false
let countriesLoadPromise: Promise<CountryOption[]> | null = null

/**
 * 获取国家/地区选项的 Hook
 * @param pageNo 页码，默认为 1
 * @param pageSize 每页数量，默认为 1000
 * @param enabled 是否启用加载，默认为 true
 * @returns 国家选项数组和加载状态
 */
export function useCountries(
  pageNo: number = 1,
  pageSize: number = 1000,
  enabled: boolean = true
) {
  const [countries, setCountries] = useState<CountryOption[]>(countriesCache || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // 如果已禁用，跳过
    if (!enabled) {
      return
    }

    // 如果缓存存在，直接使用
    if (countriesCache) {
      setCountries(countriesCache)
      hasLoadedRef.current = true
      return
    }

    // 如果已加载过，跳过
    if (hasLoadedRef.current) {
      return
    }

    // 如果正在加载，等待现有请求
    if (isCountriesLoading && countriesLoadPromise) {
      countriesLoadPromise
        .then((data) => {
          setCountries(data)
          hasLoadedRef.current = true
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Failed to load countries')
          setError(error)
        })
      return
    }

    // 开始加载
    hasLoadedRef.current = true
    isCountriesLoading = true
    setIsLoading(true)
    setError(null)

    const loadCountries = async () => {
      try {
        const countryList = await queryCountry(pageNo, pageSize)
        // 将国家数据映射为选项格式，包含图标
        const countryOptions: CountryOption[] = countryList
          .filter((country) => country.id) // 过滤掉没有ID的国家
          .map((country: CountryItem) => {
            // 优先使用 twocountrycode，如果没有则使用 hzkj_code
            const countryCode = country.twocountrycode || country.hzkj_code
            
            // 在 world-countries 库中查找对应的国家信息
            const countryInfo = countryCode
              ? worldCountries.find(
                  (c: any) => c.cca2?.toUpperCase() === countryCode.toUpperCase()
                )
              : null

            // 生成国家代码（用于图标）
            const code = (countryInfo as any)?.cca2?.toLowerCase() || countryCode?.toLowerCase() || ''
            
            return {
              label: country.hzkj_name || country.name || country.description || '',
              value: country.id || '', // use id so we can send destinationId directly
              icon: code ? createFlagIcon(code) : undefined,
            }
          })
        
        // 更新缓存
        countriesCache = countryOptions
        setCountries(countryOptions)
        return countryOptions
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load countries')
        setError(error)
        console.error('Failed to load countries:', err)
        throw error
      } finally {
        setIsLoading(false)
        isCountriesLoading = false
        countriesLoadPromise = null
      }
    }

    countriesLoadPromise = loadCountries()
  }, [pageNo, pageSize, enabled])

  return { countries, isLoading, error }
}


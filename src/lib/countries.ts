// 通用国家配置（方案 A：本地数组 + emoji 国旗）
// 如需更多国家，可以在此文件中继续补充。

export type CountryOption = {
  code: string // ISO 3166-1 alpha-2 代码，例如 'US' | 'CN'
  name: string // 国家名称
  flag: string // emoji 国旗
}

export const allCountries: CountryOption[] = [
  { code: 'AX', name: 'Aland Islands', flag: '🇦🇽' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea, Republic of', flag: '🇰🇷' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'RU', name: 'Russian Federation', flag: '🇷🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
]



import Select, {
  components,
  type SingleValue,
  type StylesConfig,
  type SingleValueProps,
} from 'react-select'
import { useEffect, useState } from 'react'
import countries from 'world-countries'

type Option = {
  value: string
  label: string
  flagClass: string
}

const countryOptions: Option[] = countries.map((country) => {
  const code = country.cca2.toLowerCase()
  return {
    value: country.cca2,
    label: country.name.common,
    flagClass: `fi fi-${code}`,
  }
})

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    height: 32,
    borderRadius: 6,
    borderColor: state.isFocused ? '#f97316' : '#e5e7eb',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#f97316',
    },
    backgroundColor: 'white',
    fontSize: 12,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 32,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 6,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 12,
    padding: '6px 10px',
    backgroundColor: state.isFocused ? '#f9731610' : 'white',
    color: '#020617',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
}

type CountrySelectProps = {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  className?: string
}

export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select country',
  className,
}: CountrySelectProps) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(() => {
    if (!value) return null
    return countryOptions.find((option) => option.value === value) ?? null
  })

  // 当外部传入的 value 变化时，同步本地选中项
  useEffect(() => {
    if (!value) {
      setSelectedOption(null)
      return
    }
    const found = countryOptions.find((option) => option.value === value) ?? null
    setSelectedOption(found)
  }, [value])

  const handleChange = (option: SingleValue<Option>) => {
    setSelectedOption(option ?? null)
    onChange?.(option?.value)
  }

  const formatOptionLabel = (option: Option) => (
    <div className='flex items-center gap-2'>
      <span className={option.flagClass} aria-hidden='true' />
      <span>{option.label}</span>
    </div>
  )

  const SingleValueComponent = (props: SingleValueProps<Option>) => (
    <components.SingleValue {...props}>
      <div className='flex items-center gap-2'>
        <span className={props.data.flagClass} aria-hidden='true' />
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  )

  return (
    <div className={className}>
      <Select
        options={countryOptions}
        value={selectedOption}
        onChange={handleChange}
        isClearable
        placeholder={placeholder}
        classNamePrefix='react-select-country'
        styles={selectStyles}
        formatOptionLabel={formatOptionLabel}
        components={{ SingleValue: SingleValueComponent }}
      />
    </div>
  )
}


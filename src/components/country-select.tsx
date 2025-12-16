import Select, { type SingleValue } from 'react-select'
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
  const selected =
    countryOptions.find((option) => option.value === value) ?? null

  const handleChange = (option: SingleValue<Option>) => {
    onChange?.(option?.value)
  }

  const formatOptionLabel = (option: Option) => (
    <div className='flex items-center gap-2'>
      <span className={option.flagClass} aria-hidden='true' />
      <span>{option.label}</span>
    </div>
  )

  return (
    <div className={className}>
      <Select
        options={countryOptions}
        value={selected}
        onChange={handleChange}
        isClearable
        placeholder={placeholder}
        classNamePrefix='react-select-country'
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  )
}


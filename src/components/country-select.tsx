import { Search } from 'lucide-react'
import Select, {
  components,
  type ControlProps,
  type SingleValue,
  type StylesConfig,
} from 'react-select'
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
    borderRadius: 9999,
    borderStyle: 'dashed',
    borderColor: state.isFocused ? '#f97316' : '#d4d4d8',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#f97316',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: 8,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 0,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: 12,
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: 14,
  }),
}

const Control = (props: ControlProps<Option, false>) => (
  <components.Control {...props}>
    <Search className='mr-1 ml-2 h-3.5 w-3.5 text-gray-400' />
    {props.children}
  </components.Control>
)

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
        isSearchable
        placeholder={placeholder}
        classNamePrefix='react-select-country'
        components={{ Control }}
        styles={selectStyles}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  )
}

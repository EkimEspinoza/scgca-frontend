// Define el componente reutilizable SearchableSelect.
import { Autocomplete, TextField } from '@mui/material'

export default function SearchableSelect({
  label,
  value,
  options = [],
  onChange,
  getOptionValue = (option) => option?.value,
  getOptionLabel = (option) => option?.label ?? '',
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  size = 'small',
  fullWidth = true,
  className,
  sx,
  inputProps,
  noOptionsText = 'Sin opciones',
  disableClearable = false,
}) {
  const seleccionado = options.find((option) => String(getOptionValue(option)) === String(value)) ?? null

  return (
    <Autocomplete
      size={size}
      fullWidth={fullWidth}
      className={className}
      options={options}
      value={seleccionado}
      disabled={disabled}
      noOptionsText={noOptionsText}
      disableClearable={disableClearable}
      getOptionLabel={(option) => String(getOptionLabel(option) ?? '')}
      isOptionEqualToValue={(option, selected) => String(getOptionValue(option)) === String(getOptionValue(selected))}
      onChange={(_event, option) => onChange?.({ target: { value: option ? getOptionValue(option) : '' } })}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          inputProps={{ ...params.inputProps, ...inputProps }}
        />
      )}
    />
  )
}

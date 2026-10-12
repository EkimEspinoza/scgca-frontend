import {
    InputAdornment,
    TextField,
} from '@mui/material'

import {
    Search,
} from '@mui/icons-material'


function SearchInput({
    value,
    onChange,
    placeholder = 'Buscar...',
    ariaLabel = 'Buscar',
    maxWidth = 520,
    disabled = false,
}) {
    return (
        <TextField
            fullWidth
            size="small"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-label={ariaLabel}
            disabled={disabled}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search
                            fontSize="small"
                            sx={{
                                color: 'text.secondary',
                            }}
                        />
                    </InputAdornment>
                ),
            }}
            sx={{
                maxWidth,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#FAFBFA',
                },
            }}
        />
    )
}

export default SearchInput
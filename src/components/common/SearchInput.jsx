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
                        <Search fontSize ="small"sx={{color: 'text.secondary'}}
                        />
                    </InputAdornment>
                ),
            }}
            sx={(theme) => ({
                maxWidth,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 0.5,
                    backgroundColor: theme.scgca?.themeId === 'dark' ? '#202023' : '#FAFBFA',
                    color: theme.palette.text.primary,
                    '& fieldset': {
                        borderColor: theme.scgca?.themeId === 'dark' ? 'rgba(255, 255, 255, 0.18)' : undefined,
                    },
                    '&:hover fieldset': {
                        borderColor: theme.scgca?.themeId === 'dark' ? 'rgba(255, 255, 255, 0.26)' : undefined,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: theme.scgca?.themeId === 'dark' ? '#2FB468' : undefined,
                        boxShadow: theme.scgca?.themeId === 'dark' ? '0 0 0 3px rgba(47, 180, 104, 0.22)' : undefined,
                    },
                },
                '& .MuiInputBase-input::placeholder': {
                    color: theme.scgca?.themeId === 'dark' ? '#9A9AA2' : undefined,
                    opacity: theme.scgca?.themeId === 'dark' ? 1 : undefined,
                },
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                    color: theme.scgca?.themeId === 'dark' ? '#9A9AA2' : undefined,
                },
            })}
        />
    )
}

export default SearchInput

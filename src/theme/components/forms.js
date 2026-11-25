// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../tokens'
import { alpha } from '@mui/material/styles'

export const formOverrides = {
  MuiTextField: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        '&.app-search-input .MuiOutlinedInput-root': {
          transition: 'outline-color 160ms ease, border-color 160ms ease',
        },
      }),
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.small,
        backgroundColor: theme.palette.background.paper,

        minHeight: 42,

        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.light,
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        '&.Mui-focused': {
          outline: 'none',
          boxShadow: `0 0 0 3px ${alpha(theme.scgca?.focusColor ?? theme.palette.primary.main, 0.18)}`,
        },
      }),
    },
  },

  MuiMenuItem: {
    styleOverrides: { root: { fontSize: '12px' } },
  },

  MuiAutocomplete: {
    styleOverrides: {
      input: { fontSize: '12px' },
      option: { fontSize: '12px', '& .MuiTypography-root': { fontSize: '12px' } },
    },
  },

  MuiSelect: {
    defaultProps: {
      size: 'small',
    },

    styleOverrides: {
      select: {
        minHeight: '42px',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
      },
    },
  },

  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
    },
  },
}

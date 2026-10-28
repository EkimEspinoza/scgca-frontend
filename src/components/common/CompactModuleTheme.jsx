import { useMemo } from 'react'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'

const compactScale = {
    typography: {
        h5: { fontSize: '1.375rem', '@media (max-width:599.95px)': { fontSize: '1.25rem' } },
        h4: { fontSize: '1.375rem' },
        h6: { fontSize: '1.0625rem' },
        subtitle1: { fontSize: '0.8125rem' },
        subtitle2: { fontSize: '0.75rem' },
        body1: { fontSize: '0.75rem' },
        body2: { fontSize: '0.75rem' },
        caption: { fontSize: '0.6875rem' },
    },
    components: {
        MuiButton: { styleOverrides: { root: { minHeight: 34, fontSize: '0.75rem' } } },
        MuiInputBase: { styleOverrides: { root: { fontSize: '0.75rem' } } },
        MuiInputLabel: { styleOverrides: { root: { fontSize: '0.75rem' } } },
        MuiMenuItem: { styleOverrides: { root: { fontSize: '0.75rem', minHeight: 34 } } },
        MuiOutlinedInput: { styleOverrides: { root: { '&.MuiInputBase-sizeSmall': { minHeight: 36 } } } },
        MuiTableCell: { styleOverrides: { root: { fontSize: '0.75rem' } } },
        MuiTablePagination: {
            styleOverrides: {
                selectLabel: { fontSize: '0.75rem' },
                displayedRows: { fontSize: '0.75rem' },
            },
        },
        MuiFormHelperText: { styleOverrides: { root: { fontSize: '0.6875rem' } } },
        MuiChip: { styleOverrides: { label: { fontSize: '0.6875rem' } } },
    },
}

export default function CompactModuleTheme({ children }) {
    const outerTheme = useTheme()
    const theme = useMemo(() => createTheme(outerTheme, compactScale), [outerTheme])

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

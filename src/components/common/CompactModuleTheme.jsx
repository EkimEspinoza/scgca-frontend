import { useMemo } from 'react'
import { ThemeProvider, useTheme } from '@mui/material/styles'
import { createCompactScgcaTheme } from '../../theme/themes'

export default function CompactModuleTheme({ children }) {
    const outerTheme = useTheme()
    const theme = useMemo(() => createCompactScgcaTheme(outerTheme), [outerTheme])

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../tokens'

export const navigationOverrides = {
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.small,

        marginBottom: 2,

        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,

          color: theme.palette.primary.dark,

          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },

          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
        },

        ...(theme.scgca?.themeId === 'dark' ? {
          '&.Mui-selected.Mui-selected': {
            position: 'relative',
            backgroundColor: 'rgba(47, 180, 104, 0.14)',
            color: '#4ADE80',
            '&:hover': { backgroundColor: 'rgba(47, 180, 104, 0.2)' },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 6,
              bottom: 6,
              width: 3,
              borderRadius: '0 3px 3px 0',
              backgroundColor: '#4ADE80',
            },
            '& .MuiListItemIcon-root': { color: '#4ADE80' },
          },
        } : {}),
      }),
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.small,
        ...(theme.scgca?.themeId === 'dark' ? { color: theme.palette.text.secondary } : {}),

        ...(theme.scgca?.themeId === 'dark' ? {
          '&.MuiIconButton-colorPrimary': { color: theme.palette.text.secondary },
          '&[aria-label^="Editar"]': { color: theme.palette.text.secondary },
        } : {}),

        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          ...(theme.scgca?.themeId === 'dark' ? { color: theme.palette.text.primary } : {}),
        },

        ...(theme.scgca?.themeId === 'dark' ? {
          '&.MuiIconButton-colorPrimary:hover, &[aria-label^="Editar"]:hover': {
            color: theme.palette.text.primary,
            backgroundColor: '#26262A',
          },
        } : {}),
      }),
    },
  },
}

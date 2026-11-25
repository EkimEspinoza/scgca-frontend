// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../tokens'

export const surfaceOverrides = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },

    styleOverrides: {
      root: {
        minHeight: 40,
        borderRadius: tokens.radius.small,
        paddingLeft: 16,
        paddingRight: 16,

        textTransform: 'none',
        fontWeight: 600,
      },

      containedPrimary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      }),

      outlinedPrimary: ({ theme }) => ({
        borderColor: theme.palette.primary.light,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
  },

  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.medium,
        border: `1px solid ${theme.palette.divider}`,

        boxShadow:
          '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',

        backgroundColor: theme.palette.background.paper,
        ...(theme.scgca?.themeId === 'dark' ? {
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.035), transparent 52%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 12px 36px rgba(0, 0, 0, 0.24)',
        } : theme.scgca?.themeId === 'light' ? {
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          backgroundColor: 'rgba(255, 255, 255, 0.76)',
          borderColor: 'rgba(255, 255, 255, 0.88)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.34))',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 28px rgba(31, 41, 55, 0.08)',
        } : {}),
      }),
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        ...(theme.scgca?.themeId === 'dark' ? {
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          backgroundColor: 'rgba(28, 30, 29, 0.72)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          backgroundImage: 'linear-gradient(150deg, rgba(255, 255, 255, 0.035), transparent 55%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 12px 36px rgba(0, 0, 0, 0.22)',
        } : theme.scgca?.themeId === 'light' ? {
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          backgroundImage: 'linear-gradient(150deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.52))',
          borderColor: 'rgba(209, 213, 219, 0.76)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 10px 30px rgba(31, 41, 55, 0.07)',
        } : {}),
      }),

      rounded: {
        borderRadius: tokens.radius.medium,
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: tokens.radius.medium,

        boxShadow:
          '0 12px 32px rgba(15, 23, 42, 0.16)',

        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '20px 24px 12px',

        fontSize: '1.125rem',

        fontWeight: 700,

        color: theme.palette.text.primary,
      }),
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
        gap: 8,
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.small,
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '0.75rem',
        borderRadius: 6,
      },
    },
  },
}

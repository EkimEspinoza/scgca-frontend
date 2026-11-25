// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../tokens'

export const tableOverrides = {
  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: tokens.radius.medium,
        border: `1px solid ${theme.palette.divider}`,

        boxShadow:
          '0 1px 3px rgba(15, 23, 42, 0.04)',

        backgroundColor: theme.palette.background.paper,

        overflowX: 'auto',
        ...(theme.scgca?.themeId === 'dark' ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent 48%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 14px 38px rgba(0, 0, 0, 0.24)',
        } : theme.scgca?.themeId === 'light' ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.76)',
          borderColor: 'rgba(209, 213, 219, 0.76)',
          backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.40))',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.88), 0 12px 32px rgba(31, 41, 55, 0.08)',
        } : {}),

        '& .MuiTableCell-root.MuiTableCell-root': {
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          paddingTop: 6,
          paddingBottom: 6,
          fontSize: '10px',
        },
        '& .MuiTableCell-head.MuiTableCell-head': {
          paddingTop: 10,
          paddingBottom: 10,
          color: theme.scgca?.themeId === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
          ...(theme.scgca?.themeId === 'light' ? { backgroundColor: 'var(--table-header-bg)' } : {}),
        },
        '& .MuiTableRow-root.MuiTableRow-root.tareo-row-hover:hover > .MuiTableCell-root': {
          backgroundColor: 'var(--table-sticky-hover-bg)',
        },
        '& .tareo-table .MuiTableCell-head.MuiTableCell-head': {
          backgroundColor: 'var(--table-header-bg)',
          backgroundImage: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        },

        ...(theme.scgca?.themeId === 'dark' ? {
          '& .MuiTableCell-head.MuiTableCell-head': {
            backgroundColor: 'var(--table-header-bg)',
            color: theme.palette.text.primary,
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            paddingTop: 10,
            paddingBottom: 10,
          },
          '& .MuiTableRow-root.MuiTableRow-root:hover': {
            backgroundColor: theme.scgca.tableHover,
          },
          '& .MuiTableRow-root.MuiTableRow-root:hover > .MuiTableCell-root': {
            backgroundColor: theme.scgca.tableHover,
          },
          '& .MuiTableRow-root.MuiTableRow-root:hover > .MuiTableCell-root.tareo-sticky-cell': {
            backgroundColor: 'var(--tareo-sticky-cell-bg)',
          },
        } : {}),
      }),
    },
  },

  MuiTable: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.background.default }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,

        padding: '6px 12px',

        fontSize: '10px',

        color: theme.palette.text.primary,
      }),

      head: ({ theme }) => ({
        padding: '11px 14px',

        fontSize: '0.75rem',

        fontWeight: 700,

        color: theme.palette.text.secondary,

        backgroundColor: theme.palette.background.default,

        ...(theme.scgca?.themeId === 'dark' ? {
          fontSize: '0.68rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
        } : {}),

        whiteSpace: 'nowrap',
      }),
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition:
          'background-color 120ms ease',

        '&:hover': {
          backgroundColor: theme.scgca?.tableHover ?? theme.palette.action.hover,
        },

        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,

          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },
        },

      }),
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.small,

        fontWeight: 600,

        fontSize: '0.75rem',
      },

      colorSuccess: {
        backgroundColor: '#E8F5E9',
        color: '#1B5E20',
      },

      colorError: {
        backgroundColor: '#FFEBEE',
        color: '#C62828',
      },

      colorWarning: {
        backgroundColor: '#FFF3E0',
        color: '#E65100',
      },

      colorInfo: {
        backgroundColor: '#E3F2FD',
        color: '#1565C0',
      },
    },
  },
}

import { tokens } from './tokens'
import { alpha } from '@mui/material/styles'

export const componentOverrides = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      ':root': {},
      body: { backgroundColor: theme.palette.background.default, backgroundImage: 'none', backgroundAttachment: 'fixed' },
      '::view-transition-old(root)': { animation: 'none', zIndex: 1 },
      '::view-transition-new(root)': {
        animation: 'theme-reveal 700ms cubic-bezier(0.2, 0.75, 0.25, 1) both',
        zIndex: 2,
      },
      '@keyframes theme-reveal': {
        from: { clipPath: 'circle(0 at var(--theme-reveal-x, 0px) var(--theme-reveal-y, 100vh))' },
        to: { clipPath: 'circle(var(--theme-reveal-radius, 150vmax) at var(--theme-reveal-x, 0px) var(--theme-reveal-y, 100vh))' },
      },
      '@media (prefers-reduced-motion: reduce)': {
        '::view-transition-new(root)': { animationDuration: '1ms' },
        '.app-module-flow > *': { animation: 'none !important', transition: 'none !important' },
      },
      '*': ['dark', 'light'].includes(theme.scgca?.themeId) ? {
        scrollbarWidth: 'thin',
        scrollbarColor: theme.scgca.themeId === 'dark'
          ? 'rgba(255, 255, 255, 0.24) transparent'
          : 'rgba(107, 114, 128, 0.38) transparent',
        '&::-webkit-scrollbar': { width: 8, height: 8 },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.scgca.themeId === 'dark'
            ? 'rgba(255, 255, 255, 0.24)'
            : 'rgba(107, 114, 128, 0.38)',
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': { backgroundColor: theme.scgca.themeId === 'dark'
            ? 'rgba(255, 255, 255, 0.38)'
            : 'rgba(75, 85, 99, 0.56)' },
        },
        '&::-webkit-scrollbar-corner': { backgroundColor: 'transparent' },
      } : {},
    }),
  },
  /*
   * ======================================================
   * BUTTON
   * ======================================================
   */
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


  /*
   * ======================================================
   * CARD
   * ======================================================
   */
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


  /*
   * ======================================================
   * PAPER
   * ======================================================
   */
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


  /*
   * ======================================================
   * TEXT FIELD
   * ======================================================
   */
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


  /*
   * ======================================================
   * OUTLINED INPUT
   * ======================================================
   */
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


  /*
   * ======================================================
   * SELECT
   * ======================================================
   */
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


  /*
   * ======================================================
   * FORM CONTROL
   * ======================================================
   */
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },


  /*
   * ======================================================
   * INPUT LABEL
   * ======================================================
   */
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
    },
  },


  /*
   * ======================================================
   * TABLE
   * ======================================================
   */
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
          fontSize: '0.75rem',
        },
        '& .MuiTableCell-head.MuiTableCell-head': {
          paddingTop: 10,
          paddingBottom: 10,
          color: theme.scgca?.themeId === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
          ...(theme.scgca?.themeId === 'light' ? { backgroundColor: 'rgba(245, 246, 248, 0.68)' } : {}),
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
            backgroundColor: 'rgba(18, 18, 18, 0.56)',
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


  /*
   * ======================================================
   * TABLE HEAD
   * ======================================================
   */
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.background.default }),
    },
  },


  /*
   * ======================================================
   * TABLE CELL
   * ======================================================
   */
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,

        padding: '6px 12px',

        fontSize: '0.75rem',

        color: theme.palette.text.primary,
      }),

      head: ({ theme }) => ({
        padding: '11px 14px',

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


  /*
   * ======================================================
   * TABLE ROW
   * ======================================================
   */
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


  /*
   * ======================================================
   * CHIP
   * ======================================================
   */
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


  /*
   * ======================================================
   * DIALOG
   * ======================================================
   */
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


  /*
   * ======================================================
   * DIALOG TITLE
   * ======================================================
   */
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


  /*
   * ======================================================
   * DIALOG CONTENT
   * ======================================================
   */
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
      },
    },
  },


  /*
   * ======================================================
   * DIALOG ACTIONS
   * ======================================================
   */
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '12px 24px 20px',
        gap: 8,
      },
    },
  },


  /*
   * ======================================================
   * ALERT
   * ======================================================
   */
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radius.small,
      },
    },
  },


  /*
   * ======================================================
   * TOOLTIP
   * ======================================================
   */
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '0.75rem',
        borderRadius: 6,
      },
    },
  },


  /*
   * ======================================================
   * LIST ITEM BUTTON
   * ======================================================
   */
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


  /*
   * ======================================================
   * ICON BUTTON
   * ======================================================
   */
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


const previousCssBaselineOverrides = componentOverrides.MuiCssBaseline.styleOverrides
componentOverrides.MuiCssBaseline.styleOverrides = (theme) => {
  const dark = theme.scgca?.themeId === 'dark'
  const previous = previousCssBaselineOverrides(theme)
  const stageColors = (key) => {
    const stage = tokens.colors.stage[key]
    return dark
      ? { bg: stage.darkBg, text: stage.darkText, border: stage.darkBorder }
      : { bg: stage.lightBg, text: stage.lightText, border: stage.lightBorder }
  }
  const campo = stageColors('campo')
  const vivero = stageColors('vivero')
  const levante = stageColors('levante')

  return {
    ...previous,
    ':root': {
      ...previous[':root'],
      '--bg': theme.palette.background.default,
      '--surface': theme.palette.background.paper,
      '--surface-elevated': theme.scgca?.surfaces?.elevated ?? theme.palette.background.paper,
      '--border': theme.palette.divider,
      '--text': theme.palette.text.primary,
      '--text-muted': theme.palette.text.secondary,
      '--text-disabled': theme.palette.text.disabled,
      '--primary': theme.palette.primary.main,
      '--primary-soft': theme.scgca?.primarySoft ?? 'rgba(31, 138, 76, 0.08)',
      '--primary-active-text': theme.scgca?.focusColor ?? theme.palette.primary.main,
      '--success': theme.scgca?.status?.success ?? theme.palette.success.main,
      '--warning': theme.scgca?.status?.warning ?? theme.palette.warning.main,
      '--danger': theme.scgca?.status?.error ?? theme.palette.error.main,
      '--neutral': theme.scgca?.status?.neutral ?? theme.palette.text.secondary,
      '--table-header-bg': theme.scgca?.surfaces?.elevated ?? theme.palette.background.paper,
      '--table-sticky-bg': theme.palette.background.paper,
      '--table-sticky-even-bg': theme.palette.background.paper,
      '--table-sticky-hover-bg': theme.scgca?.tableHover ?? theme.palette.action.hover,
      '--table-row-divider': theme.scgca?.surfaces?.rowDivider ?? theme.palette.divider,
      '--table-selected-bg': theme.palette.action.selected,
      '--radius-card': `${tokens.radius.medium}px`,
      '--radius-control': `${tokens.radius.small}px`,
      '--stage-campo-bg': campo.bg,
      '--stage-campo-text': campo.text,
      '--stage-campo-border': campo.border,
      '--stage-vivero-bg': vivero.bg,
      '--stage-vivero-text': vivero.text,
      '--stage-vivero-border': vivero.border,
      '--stage-levante-bg': levante.bg,
      '--stage-levante-text': levante.text,
      '--stage-levante-border': levante.border,
      '--tareo-page-bg': theme.scgca?.tareo?.page ?? theme.palette.background.default,
      '--tareo-panel-bg': theme.scgca?.tareo?.panel ?? theme.palette.background.paper,
      '--tareo-border': theme.scgca?.tareo?.border ?? theme.palette.divider,
      '--tareo-table-header-bg': theme.scgca?.tareo?.tableHeader ?? theme.palette.background.paper,
      '--tareo-table-header-border': theme.scgca?.tareo?.tableHeaderBorder ?? theme.palette.divider,
      '--tareo-filter-border': theme.scgca?.tareo?.filterBorder ?? theme.palette.divider,
      '--tareo-placeholder': theme.scgca?.tareo?.placeholder ?? theme.palette.text.disabled,
      '--tareo-card-shadow': theme.scgca?.tareo?.shadow ?? 'none',
      '--tareo-tab-success-bg': theme.scgca?.tareo?.tabSuccessBg ?? theme.palette.action.hover,
      '--tareo-tab-success-text': theme.scgca?.tareo?.tabSuccessText ?? theme.palette.success.main,
      '--tareo-tab-neutral-bg': theme.scgca?.tareo?.tabNeutralBg ?? theme.palette.action.hover,
      '--tareo-tab-neutral-text': theme.scgca?.tareo?.tabNeutralText ?? theme.palette.text.secondary,
      '--tareo-tab-warning-bg': theme.scgca?.tareo?.tabWarningBg ?? theme.palette.action.hover,
      '--tareo-tab-warning-text': theme.scgca?.tareo?.tabWarningText ?? theme.palette.warning.main,
      '--tareo-primary-soft': theme.scgca?.tareo?.primarySoft ?? theme.scgca?.primarySoft,
    },
    body: {
      ...previous.body,
      backgroundColor: theme.palette.background.default,
      backgroundImage: 'none',
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
    },
    '.MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
    'input[type="date"]::-webkit-calendar-picker-indicator, input[type="month"]::-webkit-calendar-picker-indicator': {
      cursor: 'pointer',
      filter: theme.scgca?.calendarIconFilter,
      opacity: 1,
    },
    '.app-page-header__icon .MuiSvgIcon-root': { color: theme.palette.primary.main },
    '.tareo-module': {
      backgroundColor: 'var(--tareo-page-bg)',
      '--table-header-bg': 'var(--tareo-table-header-bg)',
      '--tareo-sticky-cell-bg': 'var(--tareo-panel-bg)',
      '--tareo-sticky-hover-bg': theme.palette.action.hover,
    },
    '.distribution-module': {
      '--distribution-column-separator': theme.scgca?.themeId === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(71, 84, 103, 0.28)',
    },
    '.tareo-module .tareo-filters-panel': theme.scgca?.themeId === 'light' ? {
      backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)',
      boxShadow: 'var(--tareo-card-shadow)',
      backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none',
    } : {},
    '.tareo-module .tareo-table-card': theme.scgca?.themeId === 'light' ? {
      backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)',
      boxShadow: 'var(--tareo-card-shadow)',
      backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none',
    } : {},
    '.tareo-module .tareo-table-card .app-data-table': theme.scgca?.themeId === 'light' ? {
      backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)',
      boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none',
    } : {},
    '.tareo-module .tareo-table-card .MuiTableCell-head': {
      backgroundColor: 'var(--tareo-table-header-bg)', borderBottomColor: 'var(--tareo-table-header-border)',
    },
    '.tareo-module .tareo-sticky-header-cell': {
      position: 'sticky',
      top: 0,
      zIndex: '20 !important',
      backgroundColor: 'var(--tareo-table-header-bg) !important',
      backgroundImage: 'none !important',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      opacity: 1,
    },
    '.tareo-module .tareo-table .MuiTableCell-body.tareo-sticky-cell': { zIndex: '1 !important' },
    '.tareo-module .app-page-header': { marginBottom: 0 },
    '.tareo-module .app-page-header__title': { fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.25, '@media (max-width: 767.95px)': { fontSize: '1.2rem' } },
    '.tareo-module .app-page-header__description': { color: theme.palette.text.secondary, fontSize: '0.75rem', lineHeight: 1.4 },
    '.tareo-module .tareo-header': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'start', gap: '16px', minWidth: 0 },
    '.tareo-module .tareo-tabs': { width: 'fit-content', maxWidth: '100%', justifySelf: 'end', borderBottom: '1px solid', borderColor: theme.palette.divider },
    '.tareo-module .tareo-tab-count': { display: 'inline-flex', alignItems: 'center', gap: '8px' },
    '.tareo-module .tareo-tab-count .MuiBadge-badge': { position: 'static', transform: 'none', minWidth: 22, height: 22, paddingInline: 8, borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 },
    '.tareo-module .tareo-tab-count--loaded .MuiBadge-badge': { backgroundColor: 'var(--tareo-tab-success-bg)', color: 'var(--tareo-tab-success-text)' },
    '.tareo-module .tareo-tab-count--pending-zero .MuiBadge-badge': { backgroundColor: 'var(--tareo-tab-neutral-bg)', color: 'var(--tareo-tab-neutral-text)' },
    '.tareo-module .tareo-tab-count--pending .MuiBadge-badge': { backgroundColor: 'var(--tareo-tab-warning-bg)', color: 'var(--tareo-tab-warning-text)' },
    '.tareo-module .tareo-filters-panel__controls .MuiInputBase-root': theme.scgca?.themeId === 'light' ? { minHeight: 40 } : {},
    '.tareo-module .tareo-filters-panel__controls .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--tareo-filter-border)' },
    '.tareo-module .tareo-filters-panel__controls .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
    '.tareo-module .tareo-filters-panel__dates': { minWidth: 220, flexShrink: 0, height: 40, borderColor: 'var(--tareo-filter-border)' },
    '.tareo-module .tareo-filters-panel__search input::placeholder': { color: 'var(--tareo-placeholder)', opacity: 1 },
    '.tareo-module .tareo-columns-toolbar': { minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, borderBottom: '1px solid', borderColor: theme.palette.divider },
    '.tareo-module .tareo-table-card .MuiTablePagination-root': { backgroundColor: 'var(--tareo-panel-bg)' },
    '.app-filters-panel.app-filters-panel': {
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      padding: '8px',
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: `${tokens.radius.medium}px`,
      backgroundColor: theme.palette.background.paper,
      boxSizing: 'border-box',
      overflow: 'hidden',
      '& .MuiInputBase-root': { fontSize: '0.75rem', minHeight: 36 },
      '& .MuiInputLabel-root, & .MuiMenuItem-root': { fontSize: '0.75rem' },
      '& .MuiButton-root': { minHeight: 36, borderRadius: `${tokens.radius.small}px`, whiteSpace: 'nowrap' },
      '& .MuiIconButton-root:not(.Mui-disabled)': { color: theme.palette.text.secondary },
      '& .MuiIconButton-root:not(.Mui-disabled):hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary },
      '& .app-filters-row.app-filters-row': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        minWidth: 0,
        padding: 0,
        flexWrap: 'wrap',
      },
      '& .tareo-filters-panel__row': { [theme.breakpoints.up('xl')]: { flexWrap: 'nowrap' } },
    },
    '.app-filters-panel.app-filters-panel.app-filters-row.app-filters-row': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },
    '.app-filters-layout': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'center', gap: '12px', width: '100%', minWidth: 0 },
    '.app-filters-layout--with-actions': { gridTemplateColumns: 'minmax(0, 1fr) auto auto' },
    '.app-filters-controls': { minWidth: 0 },
    '.app-filters-actions': { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' },
    '.app-filters-divider': { height: 36, borderColor: theme.palette.divider },
    '.app-filters-actions > .MuiButton-root': { whiteSpace: 'nowrap' },
    '.app-create-action-button': { minWidth: 0, height: 40, borderRadius: `${tokens.radius.small}px`, paddingInline: '16px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&.MuiButton-contained:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: 'none' } },
    '.app-active-filters': { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid', borderColor: theme.palette.divider },
    '.app-active-filter-chip': { maxWidth: 280, borderRadius: `${tokens.radius.small}px`, borderColor: theme.palette.divider, color: theme.palette.text.secondary, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
    '.app-clear-filters': { minHeight: 32, paddingInline: '8px', color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary, backgroundColor: theme.palette.action.hover } },
    '.app-clear-filters-icon.app-clear-filters-icon, .app-clear-filters-icon.app-clear-filters-icon.Mui-disabled': {
      color: theme.palette.primary.main,
      transition: 'transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
      '& .MuiSvgIcon-root': { color: theme.palette.primary.main },
      '&:hover, &:focus-visible': { color: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.08), boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`, outline: 'none', transform: 'scale(1.06)' },
      '&:active': { transform: 'scale(0.92)' },
      '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover, &:focus-visible, &:active': { transform: 'none' } },
    },
    '.usuarios-filters .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none' },
    '.tareo-filters-panel.tareo-filters-panel': { width: '100%', maxWidth: '100%', padding: '12px', borderRadius: `${tokens.radius.medium}px`, border: '1px solid', borderColor: theme.palette.divider, backgroundColor: theme.palette.background.paper, boxSizing: 'border-box', overflow: 'hidden', '& .MuiInputBase-root': { fontSize: '0.75rem', minHeight: 36 }, '& .MuiInputLabel-root, & .MuiMenuItem-root': { fontSize: '0.75rem' } },
    '.tareo-filters-panel__layout': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: '12px', width: '100%', minWidth: 0 },
    '.tareo-filters-panel__controls': { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 },
    '.tareo-filters-panel__year': { flex: '0 0 120px', minWidth: 110 },
    '.tareo-filters-panel__state': { flex: '0 0 128px', minWidth: 115 },
    '.tareo-filters-panel__search': { flex: '1 1 280px', minWidth: 155, '& .MuiInputBase-root': { backgroundColor: theme.palette.background.paper } },
    '.tareo-filters-panel__dates': { flex: '0 0 220px', minWidth: 180, borderRadius: `${tokens.radius.small}px`, color: theme.palette.text.secondary },
    '.tareo-filters-panel__divider': { height: 36, borderColor: theme.palette.divider },
    '.tareo-filters-panel__actions': { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' },
    '.tareo-filters-panel__upload, .app-excel-action-button': { minWidth: 0, height: 40, borderRadius: `${tokens.radius.small}px`, color: theme.palette.text.secondary, borderColor: theme.palette.divider, '&:hover': { borderColor: theme.palette.text.secondary, backgroundColor: theme.palette.action.hover } },
    '.tareo-filters-panel__active': { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid', borderColor: theme.palette.divider },
    '.tareo-filters-panel__active-chip': { maxWidth: 280, borderRadius: `${tokens.radius.small}px`, borderColor: theme.palette.divider, color: theme.palette.text.secondary, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
    '.tareo-filters-panel__clear-all': { minHeight: 32, paddingInline: '8px', color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary, backgroundColor: theme.palette.action.hover } },
    '@media (max-width: 1099.95px)': {
      '.app-filters-layout, .app-filters-layout--with-actions': { gridTemplateColumns: 'minmax(0, 1fr)' },
      '.app-filters-controls .app-filters-row': { flexWrap: 'wrap' },
      '.app-filters-divider': { width: '100%', height: 0, borderTop: '1px solid', borderLeft: 0 },
      '.tareo-filters-panel__layout': { gridTemplateColumns: 'minmax(0, 1fr)' },
      '.tareo-filters-panel__controls': { flexWrap: 'wrap' },
      '.tareo-filters-panel__divider': { width: '100%', height: 0, borderTop: '1px solid', borderLeft: 0 },
    },
    '.app-page-header': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', minWidth: 0, marginBottom: '12px' },
    '.app-page-header__main': { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
    '.app-page-header__icon': { display: 'flex', alignItems: 'center', color: theme.palette.primary.main, flexShrink: 0, '& svg': { fontSize: 22, color: `${theme.palette.primary.main} !important` } },
    '.app-page-header__copy': { minWidth: 0 },
    '.app-page-header__title-row': { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 },
    '.app-page-header__title': { fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.02em', textTransform: 'none', '@media (max-width:599.95px)': { fontSize: '1.2rem' } },
    '.app-page-header__description': { marginTop: '2px', fontSize: '0.75rem', lineHeight: 1.4 },
    '.app-page-header__summary': { marginTop: '5px', color: theme.palette.text.secondary, fontSize: '0.75rem', '& strong': { color: theme.palette.text.primary, fontWeight: 600 }, '& .tareo-summary-pending': { color: theme.palette.warning.main } },
    '.app-page-header__action': { flexShrink: 0 },
    '.app-page-title': { marginBottom: '12px' },
    '.app-page-title__heading': { fontWeight: 500, letterSpacing: '-0.02em' },
    '.app-page-title__subtitle': { marginTop: '2px', fontSize: '0.75rem', lineHeight: 1.4 },
    '.app-module-flow.app-module-flow': {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'gap 180ms ease, padding 180ms ease',
    },
    '.app-module-flow > *': {
      transition: 'width 180ms ease, max-width 180ms ease, flex-basis 180ms ease, grid-template-columns 180ms ease, gap 180ms ease, padding 180ms ease',
    },
    '@keyframes app-responsive-enter-mobile': {
      from: { opacity: 0.96, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes app-responsive-enter-tablet': {
      from: { opacity: 0.96, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes app-responsive-enter-desktop': {
      from: { opacity: 0.96, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@media (min-width: 768px) and (max-width: 1199.95px)': {
      '.app-module-flow > *': { animation: 'app-responsive-enter-tablet 180ms ease-out both' },
    },
    '@media (min-width: 1200px)': {
      '.app-module-flow > *': { animation: 'app-responsive-enter-desktop 180ms ease-out both' },
    },
    '.app-module-flow .app-page-header.app-page-header': { marginBottom: 0 },
    '.app-kpi-card': { height: '100%', border: '1px solid', borderColor: theme.palette.divider, borderRadius: `${tokens.radius.medium}px`, boxShadow: 'none' },
    '.app-kpi-card__content': { padding: '18px !important' },
    '.app-kpi-card__header': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    '.app-kpi-card__label': { fontSize: '0.8125rem', fontWeight: 400 },
    '.app-kpi-card__icon': { display: 'flex', alignItems: 'center', color: theme.palette.text.secondary },
    '.app-kpi-card__value': { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.15 },
    '.app-kpi-card__subtitle': { display: 'block', marginTop: '4px' },
    '.tareo-code': { fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace', fontSize: '0.75rem', color: theme.palette.text.secondary, fontVariantNumeric: 'tabular-nums' },
    '.tareo-code--primary': { color: theme.palette.text.primary, fontWeight: 600 },
    '.tareo-observation-empty': { color: theme.palette.text.disabled, fontSize: '0.8125rem' },
    '.tareo-record-card': { borderRadius: `${tokens.radius.medium}px` },
    '.tareo-table-card .MuiTableContainer-root': { border: 0, borderRadius: 0, boxShadow: 'none' },
    '.tareo-table-card .MuiTablePagination-root': { borderTop: '1px solid', borderColor: theme.palette.divider, color: theme.palette.text.secondary },
    '.tareo-table-card .MuiTablePagination-toolbar': { minHeight: 48, justifyContent: 'flex-end', paddingInline: '12px' },
    '@media (max-width: 767.95px)': {
      '.app-filters-actions': { width: '100%', flexWrap: 'wrap' },
      '.app-filters-actions > .MuiButton-root': { flex: '1 1 auto' },
      '.app-active-filter-chip': { maxWidth: '100%' },
      '.tareo-filters-panel': { padding: '10px' },
      '.tareo-filters-panel__controls': { alignItems: 'stretch', flexDirection: 'column' },
      '.tareo-filters-panel__year, .tareo-filters-panel__state, .tareo-filters-panel__search, .tareo-filters-panel__dates': { width: '100%', minWidth: 0, flex: '1 1 auto' },
      '.tareo-filters-panel__actions': { width: '100%' },
      '.tareo-filters-panel__upload': { width: '100%' },
      '.tareo-filters-panel__active-chip': { maxWidth: '100%' },
      '.tareo-module .tareo-header': { gridTemplateColumns: 'minmax(0, 1fr)' },
      '.tareo-module .tareo-tabs': { justifySelf: 'start' },
      '.tareo-module .tareo-filters-panel__dates': { width: '100%', minWidth: 0 },
      '.app-module-flow > *': { animation: 'app-responsive-enter-mobile 180ms ease-out both' },
      '.app-page-header': { alignItems: 'flex-start' },
      '.app-page-header__title': { fontSize: '1.2rem' },
      '.app-page-header__description': { fontSize: '0.75rem' },
    },
  }
}

componentOverrides.MuiButton.styleOverrides.root = ({ theme }) => ({
  minHeight: 36, borderRadius: tokens.radius.small, paddingInline: 14, textTransform: 'none',
  fontWeight: 500, boxShadow: 'none', '&:hover': { boxShadow: 'none' },
  '&.Mui-focusVisible': { outline: `2px solid ${theme.scgca?.focusColor ?? theme.palette.primary.main}`, outlineOffset: 2 },
})
componentOverrides.MuiButton.styleOverrides.containedPrimary = ({ theme }) => ({
  color: theme.palette.primary.contrastText, backgroundColor: theme.palette.primary.main,
  '&:hover': { backgroundColor: theme.palette.primary.dark },
})
componentOverrides.MuiButton.styleOverrides.outlinedPrimary = ({ theme }) => ({
  borderColor: theme.palette.primary.main, color: theme.palette.primary.main,
  '&:hover': { borderColor: theme.palette.primary.dark, backgroundColor: theme.palette.action.hover },
})

componentOverrides.MuiCard.styleOverrides.root = ({ theme }) => ({
  border: '1px solid', borderColor: theme.palette.divider, borderRadius: tokens.radius.medium,
  boxShadow: 'none', backgroundColor: theme.palette.background.paper, backgroundImage: 'none',
})
componentOverrides.MuiPaper.styleOverrides.root = ({ theme }) => ({
  backgroundColor: theme.palette.background.paper, backgroundImage: 'none',
  borderColor: theme.palette.divider, boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none',
})
componentOverrides.MuiPaper.styleOverrides.rounded = { borderRadius: tokens.radius.medium }

componentOverrides.MuiOutlinedInput.styleOverrides.root = ({ theme }) => ({
  borderRadius: tokens.radius.small, backgroundColor: theme.palette.background.paper, minHeight: 36,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.scgca?.focusColor ?? theme.palette.primary.main, borderWidth: 2 },
  '&.Mui-focused': { outline: 'none', boxShadow: `0 0 0 3px ${alpha(theme.scgca?.focusColor ?? theme.palette.primary.main, 0.18)}` },
})
componentOverrides.MuiSelect.styleOverrides.select = { minHeight: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }

componentOverrides.MuiTableContainer.styleOverrides.root = ({ theme }) => ({
  border: '1px solid', borderColor: theme.palette.divider, borderRadius: tokens.radius.medium,
  boxShadow: 'none', backgroundColor: theme.palette.background.paper, overflowX: 'auto',
  '& .MuiTableCell-root': { borderColor: 'var(--table-row-divider)', color: theme.palette.text.primary, padding: '12px 14px', fontSize: '0.875rem' },
  '& .MuiTableCell-head': { paddingTop: 11, paddingBottom: 11, color: theme.palette.text.secondary, backgroundColor: 'var(--table-header-bg)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
  '& .tareo-table .MuiTableCell-body': { fontSize: '0.75rem', lineHeight: 1.4, padding: '6px 14px', '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' } },
  '& .tareo-table .MuiTableCell-head': { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.35 },
  '& .MuiTableRow-root': { backgroundColor: theme.palette.background.paper, transition: 'background-color 120ms ease' },
  '& .MuiTableRow-root:hover > .MuiTableCell-root': { backgroundColor: theme.palette.action.hover },
  '& .MuiTableCell-root.tareo-sticky-cell': { backgroundColor: 'var(--table-sticky-bg)' },
  '& .MuiTableRow-root:hover > .MuiTableCell-root.tareo-sticky-cell': { backgroundColor: 'var(--table-sticky-hover-bg)' },
  '& .tareo-table .MuiTableCell-head': { backgroundColor: 'var(--table-header-bg)', backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' },
})

const baseTableContainerRoot = componentOverrides.MuiTableContainer.styleOverrides.root

// Mov. Tareo defines the shared visual language for data tables across modules.
componentOverrides.MuiTableContainer.styleOverrides.root = (args) => {
  const theme = args.theme
  return {
    ...baseTableContainerRoot(args),
    '&.app-data-table': {
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: tokens.radius.medium,
      backgroundColor: theme.palette.background.paper,
      scrollbarWidth: 'thin',
      '& .MuiTable-root .MuiTableCell-root': {
        borderBottom: '1px solid',
        borderColor: 'var(--table-row-divider)',
        color: theme.palette.text.primary,
      },
      '& .MuiTable-root .MuiTableCell-body:not([colspan])': {
        height: 36,
        boxSizing: 'border-box',
        padding: '6px 14px',
        fontSize: '0.75rem',
        lineHeight: 1.4,
        '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' },
      },
      '&.app-data-table--matrix .MuiTable-root .MuiTableCell-body[colspan="2"]': {
        height: 36,
        boxSizing: 'border-box',
        padding: '6px 14px',
        fontSize: '0.75rem',
        lineHeight: 1.4,
      },
      '& .MuiTable-root .MuiTableCell-root.app-table-action-cell': { position: 'relative', padding: 0 },
      '& .MuiTable-root .MuiTableCell-root.app-table-action-cell .MuiIconButton-root': {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 44,
        minHeight: 44,
        zIndex: 1,
      },
      '& .MuiTable-root .MuiTableCell-head': {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        padding: '11px 14px',
        color: theme.palette.text.secondary,
        backgroundColor: 'var(--table-header-bg)',
        backgroundImage: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
      },
      '& .MuiTable-root .MuiTableRow-root': {
        backgroundColor: theme.palette.background.paper,
        transition: 'background-color 120ms ease',
      },
      '& .MuiTable-root .MuiTableRow-root:hover > .MuiTableCell-root': {
        backgroundColor: theme.palette.action.hover,
      },
      '& .MuiTable-root .MuiTableCell-root.tareo-sticky-cell, & .MuiTable-root .MuiTableCell-root[style*="position: sticky"]': {
        backgroundColor: 'var(--table-sticky-bg)',
        backgroundImage: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      },
      '& .MuiTable-root .MuiTableRow-root:hover > .MuiTableCell-root.tareo-sticky-cell, & .MuiTable-root .MuiTableRow-root:hover > .MuiTableCell-root[style*="position: sticky"]': {
        backgroundColor: 'var(--table-sticky-hover-bg)',
      },
      '& .MuiTablePagination-root': {
        minHeight: 48,
        color: theme.palette.text.secondary,
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
      },
    },
  }
}
componentOverrides.MuiTableHead.styleOverrides.root = ({ theme }) => ({ backgroundColor: theme.palette.background.paper })
componentOverrides.MuiTableCell.styleOverrides.root = ({ theme }) => ({
  borderBottom: '1px solid', borderColor: theme.palette.divider,
  padding: '12px 14px', fontSize: '0.875rem', color: theme.palette.text.primary,
})
componentOverrides.MuiTableCell.styleOverrides.head = ({ theme }) => ({
  padding: '11px 14px', fontWeight: 500, fontSize: '0.8rem',
  color: theme.palette.text.secondary, backgroundColor: theme.palette.background.paper, whiteSpace: 'nowrap',
})
componentOverrides.MuiTableRow.styleOverrides.root = ({ theme }) => ({
  transition: 'background-color 120ms ease', backgroundColor: theme.palette.background.paper,
  '&:hover': { backgroundColor: theme.palette.action.hover },
  '&.Mui-selected': { backgroundColor: theme.palette.action.selected, '&:hover': { backgroundColor: theme.palette.action.selected } },
})
componentOverrides.MuiChip.styleOverrides.root = ({ theme }) => ({
  borderRadius: tokens.radius.small, fontWeight: 500, fontSize: '0.75rem',
  backgroundColor: theme.palette.background.default, color: theme.palette.text.secondary,
})
componentOverrides.MuiChip.styleOverrides.colorSuccess = ({ theme }) => ({
  backgroundColor: tokens.colors.status.success[theme.scgca?.themeId === 'dark' ? 'softDark' : 'softLight'], color: theme.palette.success.main,
})
componentOverrides.MuiChip.styleOverrides.colorError = ({ theme }) => ({
  backgroundColor: tokens.colors.status.error[theme.scgca?.themeId === 'dark' ? 'softDark' : 'softLight'], color: theme.palette.error.main,
})
componentOverrides.MuiChip.styleOverrides.colorWarning = ({ theme }) => ({
  backgroundColor: tokens.colors.status.warning[theme.scgca?.themeId === 'dark' ? 'softDark' : 'softLight'], color: theme.palette.warning.main,
})
componentOverrides.MuiChip.styleOverrides.colorInfo = ({ theme }) => ({
  backgroundColor: tokens.colors.status.info[theme.scgca?.themeId === 'dark' ? 'softDark' : 'softLight'], color: theme.palette.info.main,
})
componentOverrides.MuiTabs = {
  styleOverrides: { root: { minHeight: 38 }, indicator: ({ theme }) => ({ height: 2, borderRadius: tokens.radius.small, backgroundColor: theme.scgca?.focusColor ?? theme.palette.primary.main }) },
}
componentOverrides.MuiTab = {
  styleOverrides: { root: ({ theme }) => ({ minHeight: 38, padding: '7px 12px', textTransform: 'none', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.secondary, '&.Mui-selected': { color: theme.scgca?.focusColor ?? theme.palette.primary.main }, '&.Mui-focusVisible': { outline: `2px solid ${theme.scgca?.focusColor ?? theme.palette.primary.main}`, outlineOffset: 2 } }) },
}
componentOverrides.MuiTablePagination = {
  styleOverrides: {
    root: ({ theme }) => ({ color: theme.palette.text.secondary, borderTop: '1px solid', borderColor: theme.palette.divider }),
    toolbar: { minHeight: 48, paddingInline: 12 },
    selectLabel: { fontSize: '0.75rem' },
    displayedRows: { fontSize: '0.75rem' },
  },
}
componentOverrides.MuiDrawer = {
  styleOverrides: { paper: ({ theme }) => ({ backgroundColor: theme.scgca?.sidebar ?? theme.palette.background.paper, backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', borderRight: '1px solid', borderColor: theme.palette.divider, boxShadow: 'none' }) },
}
componentOverrides.MuiDataGrid = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderColor: theme.palette.divider, borderRadius: tokens.radius.medium,
      '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.secondary, fontSize: '0.8rem', fontWeight: 500, borderBottom: '1px solid', borderColor: theme.palette.divider },
      '& .MuiDataGrid-cell': { fontSize: '0.875rem', borderBottom: '1px solid', borderColor: theme.palette.divider },
      '& .MuiDataGrid-row:hover': { backgroundColor: theme.palette.action.hover },
    }),
  },
}

componentOverrides.MuiListItemButton.styleOverrides.root = ({ theme }) => ({
  borderRadius: tokens.radius.small, marginBottom: 2,
  '&.Mui-selected': {
    position: 'relative', backgroundColor: theme.scgca?.primarySoft ?? theme.palette.action.selected,
    color: theme.palette.primary.main,
    '&:hover': { backgroundColor: theme.scgca?.primarySoft ?? theme.palette.action.selected },
    '&::before': { content: '""', position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: '0 3px 3px 0', backgroundColor: theme.palette.primary.main },
    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
  },
})
componentOverrides.MuiIconButton.styleOverrides.root = ({ theme }) => ({
  borderRadius: tokens.radius.small, color: theme.palette.text.secondary,
  '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary },
  '&.Mui-focusVisible': { outline: `2px solid ${theme.scgca?.focusColor ?? theme.palette.primary.main}`, outlineOffset: 2 },
})

componentOverrides.MuiTableSortLabel = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.secondary,
      '&:hover': { color: theme.palette.text.primary },
      '&.Mui-active': { color: theme.palette.text.primary },
      '& .MuiTableSortLabel-icon': { opacity: 0.42, color: 'inherit', transition: 'opacity 120ms ease, color 120ms ease' },
      '&:hover .MuiTableSortLabel-icon': { opacity: 0.72 },
      '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1, color: theme.palette.text.primary },
    }),
  },
}
export default componentOverrides

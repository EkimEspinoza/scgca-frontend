export const componentOverrides = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: theme.scgca?.themeId === 'dark' ? {
        backgroundColor: '#101311',
        backgroundImage: 'none',
        backgroundAttachment: 'fixed',
      } : theme.scgca?.themeId === 'light' ? {
        backgroundColor: '#F5F6F8',
        backgroundImage: 'none',
        backgroundAttachment: 'fixed',
      } : {},
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
        borderRadius: 8,
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
        borderRadius: 12,
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
        borderRadius: 12,
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
  },


  /*
   * ======================================================
   * OUTLINED INPUT
   * ======================================================
   */
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
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
        borderRadius: 12,
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
        borderRadius: 8,

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
        borderRadius: 12,

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
        borderRadius: 8,
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
        borderRadius: 8,

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
        borderRadius: 8,
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


export default componentOverrides

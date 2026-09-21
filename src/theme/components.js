export const componentOverrides = {
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

      containedPrimary: {
        '&:hover': {
          backgroundColor: '#1B5E20',
        },
      },

      outlinedPrimary: {
        borderColor: '#A5C9A7',

        '&:hover': {
          borderColor: '#2E7D32',
          backgroundColor: '#F1F7F2',
        },
      },
    },
  },


  /*
   * ======================================================
   * CARD
   * ======================================================
   */
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,

        border: '1px solid #E0E5E2',

        boxShadow:
          '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',

        backgroundColor: '#FFFFFF',
      },
    },
  },


  /*
   * ======================================================
   * PAPER
   * ======================================================
   */
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },

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
      root: {
        borderRadius: 8,

        backgroundColor: '#FFFFFF',

        minHeight: 42,

        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#D6DDD8',
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#9DBBA0',
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#2E7D32',
          borderWidth: 2,
        },
      },
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
      root: {
        borderRadius: 12,

        border: '1px solid #E0E5E2',

        boxShadow:
          '0 1px 3px rgba(15, 23, 42, 0.04)',

        backgroundColor: '#FFFFFF',

        overflowX: 'auto',
      },
    },
  },


  /*
   * ======================================================
   * TABLE HEAD
   * ======================================================
   */
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: '#F8FAF9',
      },
    },
  },


  /*
   * ======================================================
   * TABLE CELL
   * ======================================================
   */
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #E8ECEA',

        padding: '10px 14px',

        fontSize: '0.8125rem',

        color: '#1F2937',
      },

      head: {
        padding: '11px 14px',

        fontWeight: 700,

        color: '#374151',

        backgroundColor: '#F8FAF9',

        whiteSpace: 'nowrap',
      },
    },
  },


  /*
   * ======================================================
   * TABLE ROW
   * ======================================================
   */
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition:
          'background-color 120ms ease',

        '&:hover': {
          backgroundColor: '#F1F7F2',
        },

        '&.Mui-selected': {
          backgroundColor: '#E8F5E9',

          '&:hover': {
            backgroundColor: '#E8F5E9',
          },
        },
      },
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
      paper: {
        borderRadius: 12,

        boxShadow:
          '0 12px 32px rgba(15, 23, 42, 0.16)',

        border: '1px solid #E0E5E2',
      },
    },
  },


  /*
   * ======================================================
   * DIALOG TITLE
   * ======================================================
   */
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '20px 24px 12px',

        fontSize: '1.125rem',

        fontWeight: 700,

        color: '#1F2937',
      },
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
      root: {
        borderRadius: 8,

        marginBottom: 2,

        '&.Mui-selected': {
          backgroundColor: '#E8F5E9',

          color: '#1B5E20',

          '&:hover': {
            backgroundColor: '#E8F5E9',
          },

          '& .MuiListItemIcon-root': {
            color: '#2E7D32',
          },
        },
      },
    },
  },


  /*
   * ======================================================
   * ICON BUTTON
   * ======================================================
   */
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,

        '&:hover': {
          backgroundColor: '#F1F7F2',
        },
      },
    },
  },
}


export default componentOverrides
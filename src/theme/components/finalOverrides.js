// Define estilos compartidos del tema de la aplicación.
import { alpha } from '@mui/material/styles'
import { tokens } from '../tokens'

export function applyFinalComponentOverrides(componentOverrides) {
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
componentOverrides.MuiSelect.styleOverrides.select = { minHeight: '36px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', fontSize: '12px' }

componentOverrides.MuiTableContainer.styleOverrides.root = ({ theme }) => ({
  border: '1px solid', borderColor: theme.palette.divider, borderRadius: tokens.radius.medium,
  boxShadow: 'none', backgroundColor: theme.palette.background.paper, overflowX: 'auto',
  '& .MuiTableCell-root': { borderColor: 'var(--table-row-divider)', color: theme.palette.text.primary, padding: '12px 14px', fontSize: '10px' },
  '& .MuiTableCell-head': { paddingTop: 11, paddingBottom: 11, color: theme.palette.text.secondary, backgroundColor: 'var(--table-header-bg)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
  '& .tareo-table .MuiTableCell-body': { fontSize: '10px', lineHeight: 1.4, padding: '6px 14px', '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' } },
  '& .tareo-table .MuiTableCell-head': { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.35 },
  '& .MuiTableRow-root': { backgroundColor: theme.palette.background.paper, transition: 'background-color 120ms ease' },
  '& .MuiTableRow-root:hover > .MuiTableCell-root': { backgroundColor: theme.palette.action.hover },
  '& .MuiTableCell-root.tareo-sticky-cell': { backgroundColor: 'var(--table-sticky-bg)' },
  '& .MuiTableRow-root:hover > .MuiTableCell-root.tareo-sticky-cell': { backgroundColor: 'var(--table-sticky-hover-bg)' },
  '& .MuiTableRow-root.Mui-selected > .MuiTableCell-root.tareo-sticky-cell': { backgroundColor: 'var(--table-sticky-hover-bg)' },
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
        fontSize: '10px',
        lineHeight: 1.4,
        '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' },
      },
      '&.app-data-table--matrix .MuiTable-root .MuiTableCell-body[colspan="2"]': {
        height: 36,
        boxSizing: 'border-box',
        padding: '6px 14px',
        fontSize: '10px',
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
}

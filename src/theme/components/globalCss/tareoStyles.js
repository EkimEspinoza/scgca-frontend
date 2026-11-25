// Define estilos compartidos del tema de la aplicación.
export function buildTareoGlobalCss(theme) {
  const dark = theme.scgca?.themeId === 'dark'
  const lightOnly = (styles) => theme.scgca?.themeId === 'light' ? styles : {}

  return {
    '.tareo-module': { backgroundColor: 'var(--tareo-page-bg)', '--table-header-bg': 'var(--tareo-table-header-bg)', '--tareo-sticky-cell-bg': 'var(--tareo-panel-bg)', '--tareo-sticky-hover-bg': theme.palette.action.hover },
    '.distribution-module': { '--distribution-column-separator': dark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(71, 84, 103, 0.28)' },
    '.tareo-module .tareo-filters-panel': lightOnly({ backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)', boxShadow: 'var(--tareo-card-shadow)', backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none' }),
    '.tareo-module .tareo-table-card': lightOnly({ backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)', boxShadow: 'var(--tareo-card-shadow)', backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none' }),
    '.tareo-module .tareo-table-card .app-data-table': lightOnly({ backgroundColor: 'var(--tareo-panel-bg)', borderColor: 'var(--tareo-border)', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', backgroundImage: 'none' }),
    '.tareo-module .tareo-table-card .MuiTableCell-head': { backgroundColor: 'var(--tareo-table-header-bg)', borderBottomColor: 'var(--tareo-table-header-border)' },
    '.tareo-module .tareo-sticky-header-cell': { position: 'sticky', top: 0, zIndex: '20 !important', backgroundColor: 'var(--tareo-table-header-bg) !important', backgroundImage: 'none !important', backdropFilter: 'none', WebkitBackdropFilter: 'none', opacity: 1 },
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
    '.tareo-module .tareo-filters-panel__controls .MuiInputBase-root': lightOnly({ minHeight: 40 }),
    '.tareo-module .tareo-filters-panel__controls .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--tareo-filter-border)' },
    '.tareo-module .tareo-filters-panel__controls .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
    '.tareo-module .tareo-filters-panel__dates': { minWidth: 220, flexShrink: 0, height: 40, borderColor: 'var(--tareo-filter-border)' },
    '.tareo-module .tareo-filters-panel__search input::placeholder': { color: 'var(--tareo-placeholder)', opacity: 1 },
    '.tareo-module .tareo-columns-toolbar': { minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, borderBottom: '1px solid', borderColor: theme.palette.divider },
    '.tareo-module .tareo-table-card .MuiTablePagination-root': { backgroundColor: 'var(--tareo-panel-bg)' },
  }
}

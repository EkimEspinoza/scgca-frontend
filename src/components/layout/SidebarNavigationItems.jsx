// Define el componente reutilizable SidebarNavigationItems.
import { Fragment } from 'react'
import { Divider, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material'

export function SidebarPrimaryItems({ items, collapsed = false, isActive, onNavigate, selectedSx }) {
  return items.map((item) => {
    const Icon = item.icon
    const button = (
      <ListItemButton
        key={item.text}
        selected={isActive(item.path)}
        onClick={() => onNavigate(item.path)}
        sx={{
          minHeight: 42,
          justifyContent: collapsed ? 'center' : 'initial',
          px: 2,
          '&.Mui-selected': selectedSx,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        {!collapsed && <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />}
      </ListItemButton>
    )
    return collapsed
      ? <Tooltip key={item.text} title={item.text} placement="right">{button}</Tooltip>
      : button
  })
}

export function SidebarSubmenuItems({ items, isActive, onNavigate, selectedSx, separators = false, hover = false }) {
  return items.map((item) => (
    <Fragment key={item.path}>
      {separators && item.separador && <Divider sx={{ mx: 2, my: 0.75 }} />}
      <ListItemButton
        selected={isActive(item.path)}
        onClick={() => onNavigate(item.path)}
        sx={{
          minHeight: 38,
          pl: 2.5,
          pr: 1.5,
          '&.Mui-selected': selectedSx,
          ...(hover ? { '&:hover': { backgroundColor: 'action.hover' } } : {}),
        }}
      >
        <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.75rem', lineHeight: 1.2 } }} />
      </ListItemButton>
    </Fragment>
  ))
}

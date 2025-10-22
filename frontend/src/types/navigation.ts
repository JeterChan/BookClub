export interface NavItem {
  label: string
  path: string
  icon?: React.ComponentType
  requireAuth: boolean
  mobileOnly?: boolean
}

export interface UserMenuItem {
  label: string
  path?: string
  onClick?: () => void
  icon?: React.ComponentType
  divider?: boolean
}

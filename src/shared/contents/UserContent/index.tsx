import React, {
  Component,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  AppBar,
  Box,
  Toolbar,
  List,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Hidden,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Tooltip,
  Collapse
} from '@mui/material'
import {
  PointOfSale as PointOfSaleIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Menu as MenuIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Description as DescriptionIcon,
  RequestQuote as RequestQuoteIcon,
  Category as CategoryIcon
} from '@mui/icons-material'
import { DrawerHeader, Drawer, Loading } from '../../components'
import logo from '../../../assets/images/logo.svg'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { AuthContext } from '../../contexts'
import { useRouterLoading } from '../../hooks/useRouterLoading'

interface UserContentProps {
  children: ReactNode
}

interface ISideBar {
  name: string
  icon: any
  url?: string
  open?: boolean
  children?: ISideBarChildren[]
}

interface ISideBarChildren {
  name: string
  icon: any
  url: string
}

const UserContent = ({ children }: UserContentProps) => {
  const { isAuthenticated, user, signOut } = useContext(AuthContext)

  const [open, setOpen] = useState<boolean>(true)

  const [items, setItems] = useState<ISideBar[]>([
    {
      name: 'PDV',
      icon: <PointOfSaleIcon />,
      url: '/pdv',
      children: []
    },
    {
      name: 'Dashboard',
      icon: <DashboardIcon />,
      url: '/',
      children: []
    },
    {
      name: 'Products',
      icon: <DescriptionIcon />,
      open: false,
      children: [
        {
          name: 'Items',
          icon: <InventoryIcon />,
          url: '/products'
        },
        {
          name: 'Types',
          icon: <CategoryIcon />,
          url: '/products/types'
        },
        {
          name: 'Taxes',
          icon: <RequestQuoteIcon />,
          url: '/products/taxes'
        }
      ]
    },
    {
      name: 'Users',
      icon: <PeopleIcon />,
      url: '/users',
      children: []
    }
  ])

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const openMenu = Boolean(anchorEl)

  const isLoading = useRouterLoading()

  const router = useRouter()

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles)
    }
    if (!isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated])

  const handleDrawer = () => {
    setOpen(!open)
  }

  const handleClick = (item: ISideBar | ISideBarChildren) => {
    if (item?.url) {
      router.push(item?.url)
    } else {
      setItems(
        items.map(item => {
          item.open = !item.open
          return item
        })
      )
    }
  }

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawer}
            sx={{
              marginRight: 1
            }}
          >
            <MenuIcon />
          </IconButton>
          <Image width={40} height={40} src={logo}></Image>
          <div style={{ marginLeft: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Typography sx={{ minWidth: 100 }}>Contact</Typography>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={openMenu ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMenu ? 'true' : undefined}
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={user?.avatar}
                  ></Avatar>
                </IconButton>
              </Tooltip>
            </Box>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openMenu}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                  }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>My account</MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" />
                </ListItemIcon>
                Add another account
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={signOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Hidden mdDown={open}>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader />
          <List>
            {items.map(item => (
              <>
                <ListItem
                  key={item.name}
                  disablePadding
                  sx={{
                    display: 'block'
                  }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5
                    }}
                    onClick={() => handleClick(item)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color:
                          router.pathname === item.url
                            ? theme => theme.palette.primary.main
                            : 'inherit'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        opacity: open ? 1 : 0,
                        color:
                          router.pathname === item.url
                            ? theme => theme.palette.primary.main
                            : 'inherit'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {item.children && (
                  <Collapse in={item.open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map(children => (
                        <ListItemButton
                          key={children.name}
                          sx={{ pl: 4 }}
                          onClick={() => handleClick(children)}
                        >
                          <ListItemIcon>{children.icon}</ListItemIcon>
                          <ListItemText primary={children.name} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            ))}
          </List>
        </Drawer>
      </Hidden>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
        {isLoading && <Loading />}
      </Box>
    </Box>
  )
}

export { UserContent }

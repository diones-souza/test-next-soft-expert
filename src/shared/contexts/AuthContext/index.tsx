import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { useRouter } from 'next/router'
import api from '../../services/api'
import { Notify, NotifyProps } from '../../components'
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

export interface IUser {
  name: string
  avatar: string
}

export interface ISignin {
  username: string
  password: string
}

interface AuthProviderProps {
  children: ReactNode
}

interface IAuthContext {
  isAuthenticated: boolean
  user: IUser | null
  handleOpenNotify: (data: NotifyProps) => void
  signIn: (data: ISignin) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext({} as IAuthContext)

const AuthProvider = ({ children }: AuthProviderProps) => {
  const cleanNotify: NotifyProps = {
    open: false,
    message: '',
    color: '',
    icon: null
  }

  const [user, setUser] = useState<IUser | null>(null)

  const [notify, setNotify] = useState<NotifyProps>(cleanNotify)

  const { 'softAuth.token': token } = parseCookies()

  const isAuthenticated = !!token

  const router = useRouter()

  useEffect(() => {
    handleUser()
  }, [])

  const handleOpenNotify = (data: NotifyProps) => {
    setNotify(data)
  }

  const handleCloseNotify = () => {
    setNotify(cleanNotify)
  }

  const handleUser = useCallback(() => {
    if (isAuthenticated) {
      api.get('/auth/me').then(({ data: { data } }) => {
        setUser(data)
        if (router.pathname === '/sign-in') {
          router.push('/')
        }
      })
    }
  }, [])

  async function signIn({ username, password }: ISignin) {
    api
      .post('/auth/sign-in', { username, password })
      .then(({ data }) => {
        const { token, user } = data.data

        setCookie(undefined, 'softAuth.token', token, {
          maxAge: 60 * 60 * 1 // 1 hour
        })

        setUser(user)

        setNotify({
          open: true,
          message: data.message,
          color: 'success',
          icon: <CheckCircleIcon />
        })

        router.push('/')
      })
      .catch(error => {
        const message = error?.response?.data ?? error?.message

        setNotify({
          open: true,
          message:
            typeof message === 'string' ? message : JSON.stringify(message),
          color: 'error',
          icon: <ErrorIcon />
        })
      })
  }

  async function signOut() {
    api.post('/auth/sign-out').then(({ data: { data } }) => {
      destroyCookie(undefined, 'softAuth.token')

      setUser(null)

      router.push('/sign-in')
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        handleOpenNotify,
        signIn,
        signOut
      }}
    >
      <Notify
        open={notify.open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={10}
        color={notify.color}
        icon={notify.icon}
        onClose={handleCloseNotify}
      >
        <>{notify.message}</>
      </Notify>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }

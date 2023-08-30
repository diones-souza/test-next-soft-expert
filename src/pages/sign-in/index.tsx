import React, { KeyboardEvent, useContext, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Head from 'next/head'
import * as yup from 'yup'
import { AuthContext, ISignin } from '../../shared/contexts'
import { LoadingButton } from '@mui/lab'

const Page: NextPage = () => {
  const cleanData: ISignin = {
    username: '',
    password: ''
  }

  const [isLoading, setIsLoading] = useState(false)

  const [customerData, setCustomerData] = useState(cleanData)

  const [errors, setErrors] = useState(cleanData)

  const { signIn } = useContext(AuthContext)

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [customerData])

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      validateForm()
    }
  }

  const handleChange = (event: KeyboardEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setCustomerData(prevData => ({
      ...prevData,
      [name]: value
    }))

    setErrors(prevData => ({
      ...prevData,
      [name]: ''
    }))
  }

  const validateForm = async () => {
    try {
      const schema = yup.object().shape({
        username: yup.string().required(),
        password: yup.string().required()
      })

      await schema.validate(customerData, { abortEarly: false })

      handleSignIn()
    } catch (validationErrors: any) {
      const errors: any = {}
      validationErrors.inner.forEach((error: any) => {
        errors[error.path] = error.message
      })
      setErrors(errors)
    }
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn(customerData)
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              defaultValue={customerData.username}
              onChange={handleChange}
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              defaultValue={customerData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <LoadingButton
              loading={isLoading}
              onClick={validateForm}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </LoadingButton>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default Page

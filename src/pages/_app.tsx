import React from 'react'
import Head from 'next/head'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { AppProps } from 'next/app'
import { Box } from '@mui/material'
import ThemeContainer from '../shared/theme/ThemeContainer'
import createEmotionCache from '../../config/createEmotionCache'
import { AuthProvider } from '../shared/contexts'

const clientSideEmotionCache = createEmotionCache()
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeContainer>
        <Box sx={{ display: 'flex' }}>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          </Box>
        </Box>
      </ThemeContainer>
    </CacheProvider>
  )
}

export default MyApp

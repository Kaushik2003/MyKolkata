import '../index.css'
import '../styles/brand-tokens.css'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider, useAuth } from '../context/AuthContext'
import TopNavbar from '../components/TopNavbar'
import Navbar from '../components/Navbar'

function Layout({ children }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const isAuthPage = router.pathname === '/' || router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/brand-kit'

  return (
    <div className="min-h-screen pb-16">
      {isAuthenticated && !isAuthPage && (
        <>
          <TopNavbar />
          <Navbar />
        </>
      )}
      {children}
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Head>
        <title>MyKolkata</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}

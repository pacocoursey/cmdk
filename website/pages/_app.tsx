import 'styles/globals.scss'

import 'styles/cmdk/vercel.scss'
import 'styles/cmdk/linear.scss'
import 'styles/cmdk/raycast.scss'
import 'styles/cmdk/framer.scss'

import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { NextSeo } from 'next-seo'
import Head from 'next/head'

const title = '⌘K'
const description = 'Fast, composable, unstyled command menu for React'
const siteUrl = 'https://cmdk.paco.me'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <NextSeo
        title={`${description} — ${title}`}
        description={description}
        openGraph={{
          type: 'website',
          url: siteUrl,
          title,
          description: description + '.',
          images: [
            {
              url: `${siteUrl}/og.png`,
              alt: title,
            },
          ],
        }}
      />
      <ThemeProvider disableTransitionOnChange attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

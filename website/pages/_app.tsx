import 'styles/globals.scss';

import 'styles/cmdk/vercel.scss';
import 'styles/cmdk/linear.scss';
import 'styles/cmdk/raycast.scss';
import 'styles/cmdk/framer.scss';
import 'styles/cmdk/combobox.scss';

import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider disableTransitionOnChange attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

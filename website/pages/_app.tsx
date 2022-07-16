import 'styles/globals.scss';
import 'styles/vercel.scss';
import 'styles/linear.scss';
import 'styles/raycast.scss';
import 'styles/figma.scss';
import 'styles/xcode-cmdk.scss';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider disableTransitionOnChange attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

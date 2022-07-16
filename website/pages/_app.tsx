import 'styles/globals.scss';
import 'styles/vercel.scss';
import 'styles/linear.scss';
import 'styles/raycast.scss';
import 'styles/figma.scss';
import 'styles/xcode-cmdk.scss';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

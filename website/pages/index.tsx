import styles from 'styles/index.module.scss';
import React from 'react';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import {
  XCodeCMDK,
  LinearCMDK,
  LinearIcon,
  VercelCMDK,
  VercelIcon,
  RaycastCMDK,
  RaycastIcon,
  FigmaIcon,
  CopyIcon,
  GitHubIcon,
} from 'components';
import packageJSON from '../../package.json';

type TTheme = {
  theme: Themes;
  setTheme: Function;
};

type Themes = 'linear' | 'raycast' | 'vercel' | 'xcode';

const ThemeContext = React.createContext<TTheme>({} as TTheme);

export default function Index() {
  const [theme, setTheme] = React.useState<Themes>('raycast');

  React.useEffect(() => {
    // document.body.classList.add('dark');
  }, []);

  return (
    <>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.meta}>
            <div className={styles.info}>
              <VersionBadge />
              <h1>cmdk</h1>
              <p>Fast, composable, unstyled command menu for React.</p>
            </div>

            <div className={styles.buttons}>
              <InstallButton />
              <GitHubButton />
            </div>
          </div>

          <AnimatePresence exitBeforeEnter initial={false}>
            {theme === 'xcode' && (
              <CMDKWrapper key="xcode">
                <XCodeCMDK />
              </CMDKWrapper>
            )}
            {theme === 'vercel' && (
              <CMDKWrapper key="vercel">
                <VercelCMDK />
              </CMDKWrapper>
            )}
            {theme === 'linear' && (
              <CMDKWrapper key="linear">
                <LinearCMDK />
              </CMDKWrapper>
            )}
            {theme === 'raycast' && (
              <CMDKWrapper key="raycast">
                <RaycastCMDK />
              </CMDKWrapper>
            )}
          </AnimatePresence>

          <ThemeContext.Provider value={{ theme, setTheme }}>
            <ThemeSwitcher />
          </ThemeContext.Provider>
        </div>
      </main>

      <Footer />
    </>
  );
}

function CMDKWrapper(props: MotionProps & { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
}

function InstallButton() {
  return (
    <button className={styles.installButton}>
      npm install cmdk
      <span>
        <CopyIcon />
      </span>
    </button>
  );
}

function GitHubButton() {
  return (
    <a
      href="https://github.com/pacocoursey/cmdk"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.githubButton}
    >
      <GitHubIcon />
      pacocoursey/cmdk
    </a>
  );
}

const themes = [
  {
    icon: <LinearIcon />,
    key: 'linear',
  },
  {
    icon: <FigmaIcon />,
    key: 'xcode',
  },
  {
    icon: <VercelIcon />,
    key: 'vercel',
  },
  {
    icon: <RaycastIcon />,
    key: 'raycast',
  },
];

function ThemeSwitcher() {
  const { theme, setTheme } = React.useContext(ThemeContext);
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const [showArrowKeyHint, setShowArrowKeyHint] = React.useState(false);

  React.useEffect(() => {
    function listener(e: KeyboardEvent) {
      const themeNames = themes.map((t) => t.key);

      if (e.key === 'ArrowRight') {
        const currentIndex = themeNames.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextItem = themeNames[nextIndex];

        if (nextItem) {
          setTheme(nextItem);
        }
      }

      if (e.key === 'ArrowLeft') {
        const currentIndex = themeNames.indexOf(theme);
        const prevIndex = (currentIndex - 1 + themeNames.length) % themeNames.length;
        const prevItem = themeNames[prevIndex];

        if (prevItem) {
          setTheme(prevItem);
        }
      }
    }

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [theme]);

  return (
    <div className={styles.switcher}>
      <motion.span
        className={styles.arrow}
        initial={false}
        animate={{
          opacity: showArrowKeyHint ? 1 : 0,
          x: showArrowKeyHint ? -24 : 0,
        }}
      >
        ←
      </motion.span>
      {themes.map(({ key, icon }) => {
        return (
          <button
            ref={ref}
            key={key}
            className={theme === key ? styles.activeTheme : ''}
            onClick={() => {
              setTheme(key);
              if (showArrowKeyHint === false) {
                setShowArrowKeyHint(true);
              }
            }}
          >
            {icon}
            {key}
          </button>
        );
      })}
      <motion.span
        className={styles.arrow}
        initial={false}
        animate={{
          opacity: showArrowKeyHint ? 1 : 0,
          x: showArrowKeyHint ? 24 : 0,
        }}
      >
        →
      </motion.span>
    </div>
  );
}

function VersionBadge() {
  return <span className={styles.versionBadge}>v{packageJSON.version}</span>;
}

function Footer() {
  return (
    <footer className={styles.footer}>
      Crafted by{' '}
      <a href="https://paco.me" target="_blank" rel="noopener noreferrer">
        <img src="/paco.png" alt="Avatar of Paco" />
        Paco
      </a>{' '}
      and{' '}
      <a href="https://rauno.me" target="_blank" rel="noopener noreferrer">
        <img src="/rauno.jpeg" alt="Avatar of Rauno" />
        Rauno
      </a>
    </footer>
  );
}

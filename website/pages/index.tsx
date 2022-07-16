import styles from "styles/index.module.scss";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  XCodeCMDK,
  LinearCMDK,
  LinearIcon,
  VercelCMDK,
  VercelIcon,
  RaycastCMDK,
  RaycastIcon,
  FigmaIcon,
} from "components";

type TTheme = {
  theme: "linear" | "raycast" | "vercel" | "xcode";
  setTheme: Function;
};

const ThemeContext = React.createContext<TTheme>({} as TTheme);

export default function Index() {
  const [theme, setTheme] = React.useState("raycast");

  React.useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <div className={styles.content}>
          <h1>cmdk</h1>
          <p>Blazing fast, composable command menu for React.</p>

          <Install />

          <Button>GitHub →</Button>

          <AnimatePresence exitBeforeEnter>
            {theme === "xcode" && (
              <CMDKWrapper key="xcode">
                <XCodeCMDK />
              </CMDKWrapper>
            )}
            {theme === "vercel" && (
              <CMDKWrapper key="vercel">
                <VercelCMDK />
              </CMDKWrapper>
            )}
            {theme === "linear" && (
              <CMDKWrapper key="linear">
                <LinearCMDK />
              </CMDKWrapper>
            )}
            {theme === "raycast" && (
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

function CMDKWrapper(props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      {...props}
    />
  );
}

function Install() {
  return <div className={styles.install}>npm install cmdk</div>;
}

function Button({ children }: { children: string }) {
  return (
    <a href="https://github.com/pacocoursey/cmdk" className={styles.button}>
      {children}
    </a>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = React.useContext(ThemeContext);
  return (
    <div className={styles.switcher}>
      {[
        {
          icon: <LinearIcon />,
          key: "linear",
        },
        {
          icon: <FigmaIcon />,
          key: "xcode",
        },
        {
          icon: <VercelIcon />,
          key: "vercel",
        },
        {
          icon: <RaycastIcon />,
          key: "raycast",
        },
      ].map(({ key, icon }) => {
        return (
          <button
            key={key}
            className={theme === key ? styles.activeTheme : ""}
            onClick={() => {
              setTheme(key);
            }}
          >
            {icon}
            {key}
          </button>
        );
      })}
    </div>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      Built with care by{" "}
      <a href="https://paco.me" target="_blank" rel="noopener noreferrer">
        Paco
      </a>{" "}
      and{" "}
      <a href="https://rauno.me" target="_blank" rel="noopener noreferrer">
        Rauno
      </a>
    </footer>
  );
}

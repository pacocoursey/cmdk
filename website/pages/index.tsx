import styles from 'styles/index.module.scss'
import React from 'react'
import { AnimatePresence, AnimateSharedLayout, motion, MotionProps, useInView } from 'framer-motion'
import {
  FramerCMDK,
  LinearCMDK,
  LinearIcon,
  VercelCMDK,
  VercelIcon,
  RaycastCMDK,
  RaycastIcon,
  CopyIcon,
  FramerIcon,
  GitHubIcon,
  Code,
  CopiedIcon,
} from 'components'
import packageJSON from '../../cmdk/package.json'

type TTheme = {
  theme: Themes
  setTheme: Function
}

type Themes = 'linear' | 'raycast' | 'vercel' | 'framer'

const ThemeContext = React.createContext<TTheme>({} as TTheme)

export default function Index() {
  const [theme, setTheme] = React.useState<Themes>('raycast')

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.info}>
            <VersionBadge />
            <h1>⌘K</h1>
            <p>Fast, composable, unstyled command menu for React.</p>
          </div>

          <div className={styles.buttons}>
            <InstallButton />
            <GitHubButton />
          </div>
        </div>

        <AnimatePresence exitBeforeEnter initial={false}>
          {theme === 'framer' && (
            <CMDKWrapper key="framer">
              <FramerCMDK />
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

        <div aria-hidden className={styles.line} />

        <Codeblock />
      </div>
      <Footer />
    </main>
  )
}

function CMDKWrapper(props: MotionProps & { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{
        height: 475,
      }}
      {...props}
    />
  )
}

//////////////////////////////////////////////////////////////////

function InstallButton() {
  const [copied, setCopied] = React.useState(false)

  return (
    <button
      className={styles.installButton}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`npm install cmdk`)
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 2000)
        } catch (e) {}
      }}
    >
      npm install cmdk
      <span>{copied ? <CopiedIcon /> : <CopyIcon />}</span>
    </button>
  )
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
  )
}

//////////////////////////////////////////////////////////////////

const themes = [
  {
    icon: <RaycastIcon />,
    key: 'raycast',
  },
  {
    icon: <LinearIcon />,
    key: 'linear',
  },
  {
    icon: <VercelIcon />,
    key: 'vercel',
  },
  {
    icon: <FramerIcon />,
    key: 'framer',
  },
]

function ThemeSwitcher() {
  const { theme, setTheme } = React.useContext(ThemeContext)
  const ref = React.useRef<HTMLButtonElement | null>(null)
  const [showArrowKeyHint, setShowArrowKeyHint] = React.useState(false)

  React.useEffect(() => {
    function listener(e: KeyboardEvent) {
      const themeNames = themes.map((t) => t.key)

      if (e.key === 'ArrowRight') {
        const currentIndex = themeNames.indexOf(theme)
        const nextIndex = currentIndex + 1
        const nextItem = themeNames[nextIndex]

        if (nextItem) {
          setTheme(nextItem)
        }
      }

      if (e.key === 'ArrowLeft') {
        const currentIndex = themeNames.indexOf(theme)
        const prevIndex = currentIndex - 1
        const prevItem = themeNames[prevIndex]

        if (prevItem) {
          setTheme(prevItem)
        }
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  return (
    <div className={styles.switcher}>
      <motion.span
        className={styles.arrow}
        initial={false}
        animate={{
          opacity: showArrowKeyHint ? 1 : 0,
          x: showArrowKeyHint ? -24 : 0,
        }}
        style={{
          left: 100,
        }}
      >
        ←
      </motion.span>
      <AnimateSharedLayout>
        {themes.map(({ key, icon }) => {
          const isActive = theme === key
          return (
            <button
              ref={ref}
              key={key}
              data-selected={isActive}
              onClick={() => {
                setTheme(key)
                if (showArrowKeyHint === false) {
                  setShowArrowKeyHint(true)
                }
              }}
            >
              {icon}
              {key}
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  transition={{
                    type: 'spring',
                    stiffness: 250,
                    damping: 27,
                    mass: 1,
                  }}
                  className={styles.activeTheme}
                />
              )}
            </button>
          )
        })}
      </AnimateSharedLayout>
      <motion.span
        className={styles.arrow}
        initial={false}
        animate={{
          opacity: showArrowKeyHint ? 1 : 0,
          x: showArrowKeyHint ? 20 : 0,
        }}
        style={{
          right: 100,
        }}
      >
        →
      </motion.span>
    </div>
  )
}
//////////////////////////////////////////////////////////////////

function Codeblock() {
  const code = `import { Command } from 'cmdk';

<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.Input />

  <Command.List>
    {loading && <Command.Loading>Hang on…</Command.Loading>}

    <Command.Empty>No results found.</Command.Empty>

    <Command.Group heading="Fruits">
      <Command.Item>Apple</Command.Item>
      <Command.Item>Orange</Command.Item>
      <Command.Separator />
      <Command.Item>Pear</Command.Item>
      <Command.Item>Blueberry</Command.Item>
    </Command.Group>

    <Command.Item>Fish</Command.Item>
  </Command.List>
</Command.Dialog>`

  return (
    <div className={styles.codeBlock}>
      <div className={styles.line2} aria-hidden />
      <div className={styles.line3} aria-hidden />
      <Code>{code}</Code>
    </div>
  )
}

//////////////////////////////////////////////////////////////////

function VersionBadge() {
  return <span className={styles.versionBadge}>v{packageJSON.version}</span>
}

function Footer() {
  const ref = React.useRef<HTMLElement | null>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '100px',
  })
  return (
    <footer ref={ref} className={styles.footer} data-animate={isInView}>
      <div className={styles.footerText}>
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
      </div>
      <RaunoSignature />
      <PacoSignature />
    </footer>
  )
}

function RaunoSignature() {
  return (
    <motion.svg
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 0 }}
      transition={{ delay: 2.5 }}
      viewport={{ once: true }}
      className={styles.raunoSignature}
      width="356"
      height="118"
      viewBox="0 0 356 118"
      fill="none"
    >
      <path
        d="M39.6522 10.8727C32.0622 19.9486 23.7402 27.7351 17.4485 37.93C14.1895 43.2106 10.8425 48.7619 8.15072 54.3365M2 4.56219C30.9703 4.28687 59.8154 4.46461 88.706 2M5.10832 31.8394C13.3342 30.3515 21.957 30.4518 30.2799 30.1261C32.4305 30.042 44.8189 31.0777 46.043 28.5427M35.5504 60.1056C40.7881 57.8276 45.1269 55.9145 45.2348 49.7269C45.2992 46.04 42.3852 43.6679 39.7347 41.6068C37.1441 39.5922 35.2035 40.7255 34.7931 43.7239C34.4752 46.0474 34.2899 48.3127 37.0257 48.7777C42.1989 49.6571 48.6039 49.4477 53.6739 48.0927C55.9963 47.472 58.0383 46.5469 59.7769 44.897C61.5598 43.2051 59.4798 48.3421 59.2622 48.8504C57.0455 54.0293 55.0028 57.9764 61.8826 60.0079C65.247 61.0013 68.6702 59.0371 71.8755 58.2384C74.4094 57.607 78.1527 57.4135 79.4538 54.7188C80.3093 52.9471 79.5946 45.3814 78.0185 44.19C77.8193 44.0395 70.1595 58.7844 70.5548 61.5199C71.083 65.1755 85.5921 60.8116 87.8354 59.9155C93.0005 57.8521 101.259 42.1787 98.0502 46.7216C96.0097 49.6102 94.8149 54.7237 94.0336 58.1224C93.9591 58.4465 92.9251 63.1692 94.3224 62.558C100.1 60.0307 107.906 58.9913 111.843 53.589C116.212 47.5929 116.624 39.2412 120.13 32.719C123.998 25.5256 110.938 47.1508 110.652 55.3129C110.53 58.8278 110.847 62.2658 113.478 64.8739C115.031 66.4132 118.704 68.7663 120.95 67.3511C122.633 66.2906 122.854 63.0236 123.332 61.285C123.533 60.558 124.804 54.7916 125.523 57.8018C127.423 65.7487 134.234 63.8099 139.205 59.3585C141.166 57.6021 143.163 55.3598 143.895 52.7674C144.073 52.137 144.083 50.0543 142.883 50.96C140.761 52.5616 132.552 63.5513 136.828 65.8799C140.973 68.1366 147.493 69.2386 151.211 66.0229C153.763 63.8167 155.807 60.4623 157.011 57.3295C157.374 56.3842 159.996 48.1819 158.697 47.5545C157.253 46.8572 157.109 52.813 157.414 53.5674C158.282 55.7108 161.296 55.7058 163.208 55.4606C164.958 55.2361 168.071 54.7284 169.248 53.2144C170.028 52.2114 170.241 55.5535 170.738 56.7227C172.225 60.2188 177.289 62.6928 181.044 61.096C183.988 59.8437 186.231 55.0676 189.15 54.6094C192.701 54.052 190.67 50.7455 188.287 49.8024C180.738 46.815 172.87 57.705 176.69 64.571C177.646 66.2894 181.226 63.8978 182.329 63.5067C188.555 61.2998 194.823 59.1513 199.465 54.2015C200.301 53.3106 200.377 52.9071 199.546 54.504C197.173 59.0586 195.315 63.8749 193.213 68.5549C190.335 74.9632 187.327 81.8528 182.771 87.2918C171.982 100.172 154.827 106.815 139.004 110.814C107.54 118.768 70.3986 118.508 39.9452 106.375C37.0775 105.233 32.6626 103.665 30.3512 101.309C28.0213 98.9348 36.0214 97.3532 39.3217 96.9357C56.758 94.7296 74.5289 94.2763 92.0549 93.4762C135.849 91.4768 179.752 90.2295 223.344 85.2523C252.079 81.9713 280.556 77.0898 308.262 68.6373C317.289 65.8833 330.847 60.7964 339.74 56.4402C358.309 47.3441 339.301 55.8458 353.656 47.521M100.748 33.252C100.877 36.5762 102.167 37.0453 102.123 33.916"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
      />
    </motion.svg>
  )
}

function PacoSignature() {
  return (
    <motion.svg
      className={styles.pacoSignature}
      width="892"
      height="235"
      viewBox="0 0 892 235"
      fill="none"
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 0 }}
      transition={{ delay: 2.5 }}
      viewport={{ once: true }}
    >
      <path
        d="M86.684 24.8853C84.684 64.5519 81.884 144.085 86.684 144.885M39.684 8.88526C68.3506 0.385261 131.984 -7.11474 157.184 30.8853C182.384 68.8853 96.3507 111.719 50.184 128.385C26.8506 138.885 -14.116 162.085 8.68398 170.885"
        stroke="currentColor"
        strokeWidth="9"
        pathLength={1}
      />
      <path
        d="M325.184 46.8853C294.184 43.5519 231.684 60.3853 244.684 143.885C280.184 193.385 371.684 142.885 388.684 134.885C399.684 127.552 420.584 112.885 416.184 112.885C410.684 112.885 428.184 129.385 437.684 130.385C447.184 131.385 481.184 110.885 489.684 114.885C498.184 118.885 542.684 129.885 550.684 172.885C558.684 215.885 534.684 226.385 526.684 231.385C518.684 236.385 481.184 214.885 483.184 199.385C485.184 183.885 502.684 152.885 520.684 143.885C538.684 134.885 618.684 83.3853 762.684 83.3853C877.884 83.3853 894.351 80.7186 888.184 79.3853"
        stroke="currentColor"
        strokeWidth="9"
        pathLength={1}
      />
      <path
        d="M143.988 132.079C142.168 132.664 140.426 133.273 138.785 134.307C137.602 135.052 136.639 136.008 135.799 137.117C135.239 137.856 134.695 138.701 134.743 139.671C134.853 141.857 138.728 140.36 139.712 139.916C141.396 139.157 142.992 138.066 144.34 136.808C144.939 136.249 145.832 135.423 145.673 134.488C145.427 133.044 141.601 133.881 140.843 134.019C139.375 134.287 137.534 134.645 137.388 136.418C137.251 138.081 139.708 137.088 140.469 136.738C140.847 136.565 144.28 134.356 143.343 133.705C142.07 132.819 140.471 134.865 139.691 135.619C139.27 136.026 137.078 137.59 138.577 138.061C139.847 138.46 141.551 137.108 142.437 136.392C142.594 136.265 143.818 135.405 143.658 135.075C143.455 134.656 142.071 134.774 141.749 134.808C140.582 134.932 139.512 135.552 138.55 136.184C138.184 136.424 137.281 136.915 137.654 137.144C137.914 137.302 138.113 137.435 138.401 137.549C139.178 137.856 140.088 137.628 140.832 137.255C142.185 136.579 143.389 135.45 144.457 134.382C144.666 134.173 145.14 133.692 145.14 133.374C145.14 133.019 144.968 132.525 144.612 132.367C143.862 132.033 143.442 132.242 142.719 132.58C142.217 132.814 141.792 133.137 141.397 133.518C140.401 134.48 139.261 135.281 138.273 136.259C137.694 136.832 136.936 137.472 136.561 138.22C136.275 138.794 136.605 139.184 137.239 139.031C138.012 138.844 138.778 138.695 139.558 138.551C140.026 138.465 140.57 138.301 140.725 137.837"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        pathLength={1}
      />
    </motion.svg>
  )
}

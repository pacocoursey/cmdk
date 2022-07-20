import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Logo, LinearIcon, FigmaIcon, SlackIcon, YouTubeIcon, RaycastIcon } from 'components';
import { motion } from 'framer-motion';

export function RaycastCMDK() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div className="raycast">
      <Command>
        <div cmdk-raycast-top-shine="" />
        <Command.Input ref={inputRef} autoFocus placeholder="Search for apps and commands..." />
        <hr cmdk-raycast-loader="" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Suggestions">
            <Item value="Linear">
              <Logo>
                <LinearIcon />
              </Logo>
              Linear
            </Item>
            <Item value="Figma">
              <Logo>
                <FigmaIcon />
              </Logo>
              Figma
            </Item>
            <Item value="Slack">
              <Logo>
                <SlackIcon />
              </Logo>
              Slack
            </Item>
            <Item value="YouTube">
              <Logo>
                <YouTubeIcon />
              </Logo>
              YouTube
            </Item>
            <Item value="Raycast">
              <Logo>
                <RaycastIcon />
              </Logo>
              Raycast
            </Item>
          </Command.Group>
        </Command.List>

        <div cmdk-raycast-footer="">
          <RaycastLightIcon />

          <SubCommand inputRef={inputRef} />
        </div>
      </Command>
    </div>
  );
}

function Item({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <Command.Item value={value}>
      {children}
      <span cmdk-raycast-meta="">Application</span>
    </Command.Item>
  );
}

function SubCommand({ inputRef }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function listener(e) {
      if (e.key === 'k' && e.metaKey) {
        setOpen((o) => !o);
      }
    }

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);

  return (
    <Popover.Root open={open}>
      <Popover.Trigger cmdk-raycast-subcommand-trigger="" onClick={() => setOpen(true)} aria-expanded={open}>
        Actions
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="end"
        className="raycast-submenu"
        sideOffset={16}
        alignOffset={0}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          console.log(inputRef);
          inputRef?.current?.focus();
        }}
      >
        <Command>
          <Command.List>
            <Command.Item>One</Command.Item>
          </Command.List>
          <Command.Input placeholder="Search for action..." />
        </Command>
      </Popover.Content>
    </Popover.Root>
  );
}

function TerminalIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}

function RaycastLightIcon() {
  return (
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M934.302 511.971L890.259 556.017L723.156 388.902V300.754L934.302 511.971ZM511.897 89.5373L467.854 133.583L634.957 300.698H723.099L511.897 89.5373ZM417.334 184.275L373.235 228.377L445.776 300.923H533.918L417.334 184.275ZM723.099 490.061V578.209L795.641 650.755L839.74 606.652L723.099 490.061ZM697.868 653.965L723.099 628.732H395.313V300.754L370.081 325.987L322.772 278.675L278.56 322.833L325.869 370.146L300.638 395.379V446.071L228.097 373.525L183.997 417.627L300.638 534.275V634.871L133.59 467.925L89.4912 512.027L511.897 934.461L555.996 890.359L388.892 723.244H489.875L606.516 839.892L650.615 795.79L578.074 723.244H628.762L653.994 698.011L701.303 745.323L745.402 701.221L697.868 653.965Z"
        fill="#FF6363"
      />
    </svg>
  );
}

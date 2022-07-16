import React from 'react';
import { Command } from 'cmdk';
import { Logo, LinearIcon, FigmaIcon, SlackIcon, YouTubeIcon, RaycastIcon } from 'components';

export function RaycastCMDK() {
  return (
    <div className="raycast">
      <Command>
        <Command.Input placeholder="Search for apps or commands..." />
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
        <SubCommand />
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

function SubCommand() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button cmdk-raycast-subcommand-trigger="" onClick={() => setOpen(true)}>
        Open Application
        <hr />
        <TerminalIcon />
      </button>
      {/* TODO:  This gets portalled, how do we make it relative to the parent CMDK? */}
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Command.Input placeholder="Search" />
        <Command.List>
          <Command.Item>One</Command.Item>
        </Command.List>
      </Command.Dialog>
    </>
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

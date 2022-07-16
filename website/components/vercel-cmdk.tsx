import { Command } from 'cmdk';
import { Logo, LinearIcon, FigmaIcon, SlackIcon, YouTubeIcon, RaycastIcon } from 'components';

export function VercelCMDK() {
  return (
    <div className="vercel">
      <Command>
        <Command.Input placeholder="What do you need?" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Letters">
            <Command.Item value="Linear">
              <Logo>
                <LinearIcon />
              </Logo>
              Linear
            </Command.Item>
            <Command.Item value="Figma">
              <Logo>
                <FigmaIcon />
              </Logo>
              Figma
            </Command.Item>
            <Command.Item value="Slack">
              <Logo>
                <SlackIcon />
              </Logo>
              Slack
            </Command.Item>
            <Command.Item value="YouTube">
              <Logo>
                <YouTubeIcon />
              </Logo>
              YouTube
            </Command.Item>
            <Command.Item value="Raycast">
              <Logo>
                <RaycastIcon />
              </Logo>
              Raycast
            </Command.Item>
            <Command.Item>Pear</Command.Item>
            <Command.Item>Orange</Command.Item>
            <Command.Item>Blueberry</Command.Item>
            <Command.Item>fds</Command.Item>
            <Command.Item>asd</Command.Item>
            <Command.Item>gfd</Command.Item>
            <Command.Item>123</Command.Item>
            <Command.Item>fgdfdd</Command.Item>
          </Command.Group>

          <Command.Item>Ungrouped</Command.Item>
        </Command.List>
      </Command>
    </div>
  );
}

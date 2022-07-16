import { Command } from 'cmdk';

export function XCodeCMDK() {
  return (
    <div className="xcode">
      <Command>
        <Command.Input placeholder="Xcode" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <div xcode-cmdk-items="">
            <div xcode-cmdk-left="">
              <Command.Item>Button</Command.Item>
              <Command.Item>Color Picker</Command.Item>
              <Command.Item>Date Picker</Command.Item>
            </div>
            <div xcode-cmdk-right=""></div>
          </div>
        </Command.List>
      </Command>
    </div>
  );
}

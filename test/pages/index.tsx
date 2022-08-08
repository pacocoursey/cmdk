import { Command } from 'cmdk'

const Page = () => {
  return (
    <div>
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          <Command.Item onSelect={() => console.log('Item selected')}>Item</Command.Item>
          <Command.Item value="xxx">Value</Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page

import { Command } from 'cmdk'

const Page = () => {
  return (
    <div>
      <Command className="root">
        <Command.Input placeholder="Search…" className="input" />
        <Command.Grid columns={2} className="list">
          <Command.Empty className="empty">No results.</Command.Empty>
          <Command.Item onSelect={() => console.log('Item selected')} className="item">
            Item
          </Command.Item>
          <Command.Item value="xxx" className="item">
            Value
          </Command.Item>
          <Command.Item value="ddd" className="item">
            Value 2
          </Command.Item>
          <Command.Item value="fff" className="item">
            Value 3
          </Command.Item>
        </Command.Grid>
      </Command>
    </div>
  )
}

export default Page

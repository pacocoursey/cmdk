import { Command } from 'cmdk'

const Page = () => {
  return (
    <div>
      <Command className="root">
        <Command.Input placeholder="Search…" className="input" />
        <Command.List className="list">
          <Command.Empty className="empty">No results.</Command.Empty>
          <Command.Item onSelect={() => console.log('Item selected')} className="item">
            {/* <span> to force textValue instead of children */}
            <span>Item</span>
          </Command.Item>
          <Command.Item value="xxx" className="item">
            Value
          </Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page

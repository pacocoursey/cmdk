import { Command } from 'cmdk'

const Page = () => {
  return (
    <div>
      <Command className="root">
        <Command.Input placeholder="Search…" className="input" />
        <Command.List className="list">
          <Command.Empty className="empty">No results.</Command.Empty>
          <Command.Item value="removed" className="item">
            To be removed
          </Command.Item>
          <Command.Item value="foo.bar112.value" className="item">
            Not to be removed
          </Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page

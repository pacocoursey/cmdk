import { Command } from 'cmdk'

const Page = () => {
  return (
    <div>
      <Command className="root">
        <Command.Input placeholder="Search…" className="input" />
        <Command.Grid columns={2} className="list">
          <Command.Empty className="empty">No results.</Command.Empty>
          <Command.Item className="item">A</Command.Item>
          <Command.Item className="item">B</Command.Item>
          <Command.Item className="item">C</Command.Item>
          <Command.Item className="item">D</Command.Item>
          <Command.Item className="item">E</Command.Item>
        </Command.Grid>
      </Command>
    </div>
  )
}

export default Page

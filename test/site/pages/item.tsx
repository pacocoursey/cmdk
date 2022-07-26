import { Command } from 'cmdk'
import * as React from 'react'

const Page = () => {
  const [unmount, setUnmount] = React.useState(false)
  const [mount, setMount] = React.useState(false)

  return (
    <div>
      <button data-testid="mount" onClick={() => setMount(!mount)}>
        Mount item B
      </button>

      <button data-testid="unmount" onClick={() => setUnmount(!unmount)}>
        Unmount item A
      </button>

      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          {!unmount && <Command.Item>A</Command.Item>}
          {mount && <Command.Item>B</Command.Item>}
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
